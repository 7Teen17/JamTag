import * as SecureStore from "expo-secure-store";
import * as SQLite from "expo-sqlite";
import type { MusicTrack, SongTag } from "../services/music/types";

const db = SQLite.openDatabaseSync("music.db");

export const tagColors = [
  "#DC2626",
  "#2563EB",
  "#16A34A",
  "#9333EA",
  "#EA580C",
];

const songTagSnapshots = new Map<string, SongTag[]>();
const songTagListeners = new Map<string, Set<() => void>>();
const recentlyTaggedSnapshots = new Map<number, string[]>();
const recentlyTaggedListeners = new Set<() => void>();
const songsByTagSnapshots = new Map<number, MusicTrack[]>();
const songsByTagListeners = new Map<number, Set<() => void>>();

const MANAGED_PLAYLIST_KEY = "MANAGED_PLAYLIST";

export function subscribeRecentlyTagged(listener: () => void) {
  recentlyTaggedListeners.add(listener);
  return () => {
    recentlyTaggedListeners.delete(listener);
  };
}

export function getRecentlyTaggedSongIds(limit = 10) {
  return db
    .getAllSync<{ id: string }>(
      `SELECT s.id FROM songs AS s
     WHERE s.last_tagged_at IS NOT NULL
       AND EXISTS (SELECT 1 FROM song_tags AS st WHERE st.song_id = s.id)
     ORDER BY s.last_tagged_at DESC, s.id ASC
     LIMIT ?`,
      [limit],
    )
    .map((song) => song.id);
}

export function getSongsByTagsSnapshot(tagID: number) {
  let songs = songsByTagSnapshots.get(tagID);
  if (!songs) {
    songs = getSongsFromTags([tagID]);
    songsByTagSnapshots.set(tagID, songs);
  }
  return songs;
}

function notifySongsByTagChanged(tagID: number) {
  songsByTagSnapshots.delete(tagID);
  songsByTagListeners.get(tagID)?.forEach((listener) => listener());
}

export function getRecentlyTaggedSnapshot(limit = 10) {
  let songIds = recentlyTaggedSnapshots.get(limit);
  if (!songIds) {
    songIds = getRecentlyTaggedSongIds(limit);
    recentlyTaggedSnapshots.set(limit, songIds);
  }
  return songIds;
}

function notifyRecentlyTaggedChanged() {
  recentlyTaggedSnapshots.clear();
  recentlyTaggedListeners.forEach((listener) => listener());
}

export function subscribeSongsByTag(tagID: number, listener: () => void) {
  let listeners = songsByTagListeners.get(tagID);
  if (!listeners) {
    listeners = new Set();
    songsByTagListeners.set(tagID, listeners);
  }
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) songsByTagListeners.delete(tagID);
  };
}

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

export function getSongTagsSnapshot(songId: string): SongTag[] {
  let tags = songTagSnapshots.get(songId);
  if (!tags) {
    tags = songId ? getTagsFromSong({ providerTrackId: songId }) : getAllTags();
    songTagSnapshots.set(songId, tags);
  }
  return tags;
}

function notifySongTagsChanged(songId: string) {
  songTagSnapshots.delete(songId);
  songTagListeners.get(songId)?.forEach((listener) => listener());
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
      is_explicit INTEGER NOT NULL DEFAULT 0,
      last_tagged_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL DEFAULT '#079f38'
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

export async function getManagedPlaylistId() {
  return SecureStore.getItemAsync(MANAGED_PLAYLIST_KEY);
}

export async function saveManagedPlaylistId(playlistId: string) {
  await SecureStore.setItemAsync(MANAGED_PLAYLIST_KEY, playlistId);
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

export function createTag(name: string, color?: string): SongTag {
  const normalizedName = name.trim().toLowerCase();
  if (!normalizedName) {
    throw new Error("Tag name cannot be empty.");
  }
  const existingTag = db.getFirstSync<SongTag>(
    "SELECT id, name, color FROM tags WHERE name = ?",
    [normalizedName],
  );

  if (existingTag) {
    return existingTag;
  }

  const tagColor =
    color ?? tagColors[Math.floor(Math.random() * tagColors.length)];
  if (!/^#[0-9a-f]{6}$/i.test(tagColor)) {
    throw new Error("Tag color must be a six-digit hex color.");
  }
  const insertResult = db.runSync(
    "INSERT INTO tags (name, color) VALUES (?, ?)",
    [normalizedName, tagColor],
  );
  notifySongTagsChanged("");
  return {
    id: insertResult.lastInsertRowId,
    name: normalizedName,
    color: tagColor,
  };
}

export function deleteTag(tagId: SongTag["id"]) {
  const songs = db.getAllSync<{ song_id: string }>(
    "SELECT song_id FROM song_tags WHERE tag_id = ?",
    [tagId],
  );
  db.withTransactionSync(() => {
    db.runSync("DELETE FROM tags WHERE id = ?", [tagId]);
    const now = Date.now();
    songs.forEach(({ song_id }) => {
      db.runSync("UPDATE songs SET last_tagged_at = ? WHERE id = ?", [
        now,
        song_id,
      ]);
    });
  });
  notifySongTagsChanged("");
  songs.forEach(({ song_id }) => notifySongTagsChanged(song_id));
  if (songs.length > 0) notifyRecentlyTaggedChanged();
}

export function updateTag(tag: SongTag): void {
  const name = tag.name.trim().toLowerCase();

  if (!name) {
    throw new Error("Tag name cannot be empty.");
  }
  if (!/^#[0-9a-f]{6}$/i.test(tag.color)) {
    throw new Error("Tag color must be a six-digit hex color.");
  }

  const duplicate = db.getFirstSync<{ id: number }>(
    "SELECT id FROM tags WHERE name = ? AND id != ?",
    [name, tag.id],
  );
  if (duplicate) {
    throw new Error("A tag with that name already exists.");
  }

  const result = db.runSync(
    "UPDATE tags SET name = ?, color = ? WHERE id = ?",
    [name, tag.color, tag.id],
  );
  if (!result.changes) {
    throw new Error("Tag no longer exists.");
  }

  const songs = db.getAllSync<{ song_id: string }>(
    "SELECT song_id FROM song_tags WHERE tag_id = ?",
    [tag.id],
  );
  notifySongTagsChanged("");
  songs.forEach(({ song_id }) => notifySongTagsChanged(song_id));
}

export function setTag(
  song: MusicTrack,
  tagId: SongTag["id"],
  isEnabled: boolean,
) {
  if (!db.getFirstSync("SELECT id FROM tags WHERE id = ?", [tagId])) {
    return;
  }

  let changed = false;
  db.withTransactionSync(() => {
    if (isEnabled) cacheSong(song);
    const result = db.runSync(
      isEnabled
        ? "INSERT OR IGNORE INTO song_tags (song_id, tag_id) VALUES (?, ?)"
        : "DELETE FROM song_tags WHERE song_id = ? AND tag_id = ?",
      [song.providerTrackId, tagId],
    );
    changed = result.changes > 0;
    if (changed) {
      db.runSync("UPDATE songs SET last_tagged_at = ? WHERE id = ?", [
        Date.now(),
        song.providerTrackId,
      ]);
    }
  });
  if (changed) {
    notifySongTagsChanged(song.providerTrackId);
    notifyRecentlyTaggedChanged();
    notifySongsByTagChanged(tagId);
  }
}

export function getTagsFromSong(
  providerTrack: Pick<MusicTrack, "providerTrackId">,
) {
  return db.getAllSync<SongTag>(
    `SELECT t.id, t.name, t.color
     FROM song_tags AS st
     JOIN tags AS t ON t.id = st.tag_id
     WHERE st.song_id = ?`,
    [providerTrack.providerTrackId],
  );
}

export function getAllTags() {
  return db.getAllSync<SongTag>(
    "SELECT id, name, color FROM tags ORDER BY name",
  );
}

export function getSongsFromTags(tagIds: SongTag["id"][]): MusicTrack[] {
  const uniqueTagIds = [...new Set(tagIds)];
  const placeholders = uniqueTagIds.map(() => "?").join(", ");
  const songs = db.getAllSync<MusicTrack>(
    `
      SELECT s.id AS providerTrackId, s.provider, s.title, s.artist, s.album,
        s.artwork_url AS artworkUrl, s.durationMs, s.isrc, s.is_explicit AS isExplicit
      FROM songs AS s
      ${
        uniqueTagIds.length
          ? `
        WHERE s.id IN (
          SELECT st.song_id
          FROM song_tags AS st
          WHERE st.tag_id IN (${placeholders})
          GROUP BY st.song_id
          HAVING COUNT(DISTINCT st.tag_id) = ?
        )
      `
          : `WHERE EXISTS (
              SELECT 1 FROM song_tags AS st WHERE st.song_id = s.id
            )`
      }
    `,
    uniqueTagIds.length ? [...uniqueTagIds, uniqueTagIds.length] : [],
  );

  return songs.map((song) => ({
    ...song,
    isExplicit: Boolean(song.isExplicit),
  }));
}
