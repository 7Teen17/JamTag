import * as SQLite from "expo-sqlite";
import { MusicTrack } from "../services/music/types";

const db = SQLite.openDatabaseSync("music.db");

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
      isrc TEXT
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
      INSERT INTO songs (id, provider, title, artist, album, artwork_url, durationMs, isrc)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        provider = excluded.provider,
        title = excluded.title,
        artist = excluded.artist,
        album = excluded.album,
        artwork_url = excluded.artwork_url,
        durationMs = excluded.durationMs,
        isrc = excluded.isrc
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
    ],
  );
}

export function getCachedSong(providerTrackId: string): MusicTrack | null {
  return db.getFirstSync<MusicTrack>(
    `
      SELECT
        id AS providerTrackId,
        provider,
        title,
        artist,
        album,
        artwork_url AS artworkUrl,
        durationMs,
        isrc
      FROM songs
      WHERE id = ?
    `,
    [providerTrackId],
  );
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
  db.runSync("DELETE FROM tags WHERE name = ?", [normalizeTag(tag)]);
}

export function setTag(song: MusicTrack, tag: string, isEnabled: boolean) {
  const normalizedTag = normalizeTag(tag);
  const existingTag = db.getFirstSync("SELECT id FROM tags WHERE name = ?", [
    normalizedTag,
  ]) as { id: number } | null;

  if (!existingTag) {
    return;
  }

  if (isEnabled) {
    cacheSong(song);

    db.runSync(
      "INSERT OR IGNORE INTO song_tags (song_id, tag_id) VALUES (?, ?)",
      [song.providerTrackId, existingTag.id],
    );
  } else {
    db.runSync("DELETE FROM song_tags WHERE song_id = ? AND tag_id = ?", [
      song.providerTrackId,
      existingTag.id,
    ]);
  }
}

export function getTagsFromSong(providerTrackId: string) {
  return (
    db.getAllSync(
      `
          SELECT t.name
          FROM song_tags AS st
          JOIN tags AS t ON t.id = st.tag_id
          WHERE st.song_id = ?
        `,
      [providerTrackId],
    ) as { name: string }[]
  ).map((row) => row.name);
}

export function getSongsFromTag(tag: string) {
  const tagRow = db.getFirstSync("SELECT id FROM tags WHERE name = ?", [
    normalizeTag(tag),
  ]) as { id: number } | null;

  if (!tagRow) {
    return [];
  }

  return db.getAllSync(
    `
        SELECT s.id AS providerTrackId, s.provider, s.title, s.artist, s.album, s.artwork_url AS artworkUrl, s.durationMs, s.isrc
        FROM song_tags AS st
        JOIN songs AS s ON s.id = st.song_id
        WHERE st.tag_id = ?
      `,
    [tagRow.id],
  ) as MusicTrack[];
}
