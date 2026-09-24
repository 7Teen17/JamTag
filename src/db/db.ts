import * as SQLite from "expo-sqlite";
import { MusicTrack } from "../services/music/types";

const db = SQLite.openDatabaseSync("music.db");

const songTagSnapshots = new Map<string, string[]>();
const songTagListeners = new Map<string, Set<() => void>>();
const emptyTags: string[] = [];

export function subscribeSongTags(songId: string, listener: () => void) {
  let listeners = songTagListeners.get(songId);
  if (!listeners) {
    listeners = new Set();
    songTagListeners.set(songId, listeners);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) songTagListeners.delete(songId);
  };
}

export function getSongTagsSnapshot(songId: string) {
  if (!songId) return emptyTags;
  // React needs the same array reference until this song's tags change.
  let tags = songTagSnapshots.get(songId);
  if (!tags) {
    tags = getTagsFromSong({ providerTrackId: songId });
    songTagSnapshots.set(songId, tags);
  }
  return tags;
}

function notifySongTagsChanged(songId: string) {
  songTagSnapshots.delete(songId);
  songTagListeners.get(songId)?.forEach((listener) => listener());
}

function normalizeTag(tag: string) {
  const normalizedTag = tag.trim().toLowerCase();

  if (!normalizedTag) {
    throw new Error("Tag name cannot be empty.");
  }

  return normalizedTag;
}

export function setupDB() {
  db.execSync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS songs (
      id TEXT PRIMARY KEY,
      provider TEXT NOT NULL,
      title TEXT NOT NULL,
      artist TEXT,
      album TEXT,
      artwork_url TEXT,
      durationMs INTEGER,
      isrc TEXT,
      is_explicit INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS song_tags (
      song_id TEXT NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (song_id, tag_id),
      FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );
  `);
}

export function cacheSong(song: MusicTrack) {
  db.runSync(
    `
      INSERT INTO songs (id, provider, title, artist, album, artwork_url, durationMs, isrc, is_explicit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        provider = excluded.provider,
        title = excluded.title,
        artist = excluded.artist,
        album = excluded.album,
        artwork_url = excluded.artwork_url,
        durationMs = excluded.durationMs,
        isrc = excluded.isrc,
        is_explicit = excluded.is_explicit
    `,
    [
      song.providerTrackId,
      song.provider,
      song.title,
      song.artist,
      song.album ?? null,
      song.artworkUrl ?? null,
      song.durationMs ?? null,
      song.isrc ?? null,
      Number(song.isExplicit),
    ],
  );
}

export function getCachedSong(
  providerTrackId: string,
  isrc?: string,
): MusicTrack | null {
  const song = db.getFirstSync<MusicTrack>(
    `
      SELECT
        id AS providerTrackId,
        provider,
        title,
        artist,
        album,
        artwork_url AS artworkUrl,
        durationMs,
        isrc,
        is_explicit AS isExplicit
      FROM songs
      WHERE id = ?
    `,
    [providerTrackId],
  );
  if (song) {
    return { ...song, isExplicit: Boolean(song.isExplicit) };
  }

  if (!isrc) {
    return null;
  }

  const songWithMatchingIsrc = db.getFirstSync<MusicTrack>(
    `
      SELECT
        id AS providerTrackId,
        provider,
        title,
        artist,
        album,
        artwork_url AS artworkUrl,
        durationMs,
        isrc,
        is_explicit AS isExplicit
      FROM songs
      WHERE isrc = ?
    `,
    [isrc],
  );

  return songWithMatchingIsrc
    ? {
        ...songWithMatchingIsrc,
        isExplicit: Boolean(songWithMatchingIsrc.isExplicit),
      }
    : null;
}

export function createTag(tag: string) {
  const normalizedTag = normalizeTag(tag);
  const existingTag = db.getFirstSync("SELECT id FROM tags WHERE name = ?", [
    normalizedTag,
  ]) as { id: number } | null;

  if (existingTag) {
    return existingTag.id;
  }

  const insertResult = db.runSync("INSERT INTO tags (name) VALUES (?)", [
    normalizedTag,
  ]);
  return insertResult.lastInsertRowId;
}

export function deleteTag(tag: string) {
  const normalizedTag = normalizeTag(tag);
  const songs = db.getAllSync<{ song_id: string }>(
    `SELECT st.song_id FROM song_tags st
     JOIN tags t ON t.id = st.tag_id WHERE t.name = ?`,
    [normalizedTag],
  );
  db.runSync("DELETE FROM tags WHERE name = ?", [normalizedTag]);
  songs.forEach(({ song_id }) => notifySongTagsChanged(song_id));
}

export function setTag(song: MusicTrack, tag: string, isEnabled: boolean) {
  const normalizedTag = normalizeTag(tag);
  const existingTag = db.getFirstSync(
    "SELECT id FROM tags WHERE LOWER(name) = ?",
    [normalizedTag],
  ) as { id: number } | null;

  if (!existingTag) {
    return;
  }

  if (isEnabled) {
    cacheSong(song);

    const result = db.runSync(
      "INSERT OR IGNORE INTO song_tags (song_id, tag_id) VALUES (?, ?)",
      [song.providerTrackId, existingTag.id],
    );
    if (result.changes > 0) notifySongTagsChanged(song.providerTrackId);
  } else {
    const result = db.runSync(
      "DELETE FROM song_tags WHERE song_id = ? AND tag_id = ?",
      [song.providerTrackId, existingTag.id],
    );
    if (result.changes > 0) notifySongTagsChanged(song.providerTrackId);
  }
}

export function getTagsFromSong(
  providerTrack: Pick<MusicTrack, "providerTrackId">,
) {
  return (
    db.getAllSync(
      `
          SELECT t.name
          FROM song_tags AS st
          JOIN tags AS t ON t.id = st.tag_id
          WHERE st.song_id = ?
        `,
      [providerTrack.providerTrackId],
    ) as { name: string }[]
  ).map((row) => row.name);
}

export function getAllTags() {
  return (
    db.getAllSync("SELECT name FROM tags ORDER BY name") as { name: string }[]
  ).map((row) => row.name);
}

export function getSongsFromTag(tag: string) {
  const tagRow = db.getFirstSync("SELECT id FROM tags WHERE LOWER(name) = ?", [
    normalizeTag(tag),
  ]) as { id: number } | null;

  if (!tagRow) {
    return [];
  }

  const songs = db.getAllSync(
    `
        SELECT s.id AS providerTrackId, s.provider, s.title, s.artist, s.album, s.artwork_url AS artworkUrl, s.durationMs, s.isrc, s.is_explicit AS isExplicit
        FROM song_tags AS st
        JOIN songs AS s ON s.id = st.song_id
        WHERE st.tag_id = ?
      `,
    [tagRow.id],
  ) as MusicTrack[];

  return songs.map((song) => ({
    ...song,
    isExplicit: Boolean(song.isExplicit),
  }));
}

export function getSongsFromTags(tags: string[]): MusicTrack[] {
  const normalizedTags = [...new Set(tags.map(normalizeTag))];
  const placeholders = normalizedTags.map(() => "?").join(", ");
  const songs = db.getAllSync<MusicTrack>(
    `
      SELECT s.id AS providerTrackId, s.provider, s.title, s.artist, s.album,
        s.artwork_url AS artworkUrl, s.durationMs, s.isrc, s.is_explicit AS isExplicit
      FROM songs AS s
      ${
        normalizedTags.length
          ? `
        WHERE s.id IN (
          SELECT st.song_id
          FROM song_tags AS st
          JOIN tags AS t ON t.id = st.tag_id
          WHERE LOWER(t.name) IN (${placeholders})
          GROUP BY st.song_id
          HAVING COUNT(DISTINCT LOWER(t.name)) = ?
        )
      `
          : ""
      }
    `,
    normalizedTags.length ? [...normalizedTags, normalizedTags.length] : [],
  );

  return songs.map((song) => ({
    ...song,
    isExplicit: Boolean(song.isExplicit),
  }));
}
