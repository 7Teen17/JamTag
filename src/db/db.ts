import * as SQLite from "expo-sqlite";
import { MusicTrack } from "../services/music/types";

const db = SQLite.openDatabaseSync("music.db");

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
  try {
    db.runSync("INSERT OR IGNORE INTO songs VALUES (?, ?, ?, ?, ?, ?, ?, ?)", [
      song.providerTrackId,
      song.provider,
      song.title,
      song.artist,
      song.album ?? null,
      song.artworkUrl ?? null,
      song.durationMs ?? null,
      song.isrc ?? null,
    ]);
  } catch (error) {
    console.error("Could not cache song: ", error);
  }
}

export function addTag(tag: string) {
  try {
    const existingTag = db.getFirstSync("SELECT id FROM tags WHERE name = ?", [
      tag,
    ]) as { id: number } | null;

    if (existingTag) {
      return existingTag.id;
    }

    const insertResult = db.runSync("INSERT INTO tags (name) VALUES (?)", [
      tag,
    ]);
    return insertResult.lastInsertRowId;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export function deleteTag(tag: string) {
  try {
    db.runSync("DELETE FROM tags WHERE name = ?", [tag]);
  } catch (error) {
    console.error(error);
  }
}

export function setTag(song: MusicTrack, tag: string, isEnabled: boolean) {
  try {
    const existingTag = db.getFirstSync("SELECT id FROM tags WHERE name = ?", [
      tag,
    ]) as { id: number } | null;

    if (!existingTag) {
      return;
    }

    if (isEnabled) {
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
  } catch (error) {
    console.error(error);
  }
}

export function getTagsFromSong(providerTrackId: string) {
  try {
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
  } catch (error) {
    console.log(error);
    return [];
  }
}

export function getSongsFromTag(tag: string) {
  try {
    const tagRow = db.getFirstSync("SELECT id FROM tags WHERE name = ?", [
      tag,
    ]) as { id: number } | null;

    if (!tagRow) {
      return [];
    }

    return db.getAllSync(
      `
        SELECT s.id, s.provider, s.title, s.artist, s.album, s.artwork_url AS artworkUrl, s.durationMs, s.isrc
        FROM song_tags AS st
        JOIN songs AS s ON s.id = st.song_id
        WHERE st.tag_id = ?
      `,
      [tagRow.id],
    );
  } catch (error) {
    console.log(error);
    return [];
  }
}
