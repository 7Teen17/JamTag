import { PixelRatio } from "react-native";
import type { SongTag } from "../services/music/types";

export function getVisibleTagCount(tags: SongTag[], rowWidth: number, gap: number) {
  if (rowWidth <= 0 || tags.length === 0) return 0;
  const fontScale = PixelRatio.getFontScale();
  // Regular tags use 10px text and 5px padding on each side.
  // Round character widths up and add a little extra breathing room.
  const widths = tags.map((tag) => tag.name.length * 6.5 * fontScale + 10 + 4);
  let usedWidth = 0;
  let visibleCount = 0;

  for (const width of widths) {
    const nextWidth = usedWidth + (visibleCount > 0 ? gap : 0) + width;
    if (nextWidth > rowWidth) break;
    usedWidth = nextWidth;
    visibleCount++;
  }

  // All tags fit: no overflow count needs space.
  if (visibleCount === tags.length) return visibleCount;

  while (visibleCount > 0) {
    const hiddenCount = tags.length - visibleCount;
    const counterWidth = `+${hiddenCount}`.length * 7 * fontScale + 4;
    if (usedWidth + gap + counterWidth <= rowWidth) break;
    visibleCount--;
    usedWidth -= widths[visibleCount] + (visibleCount > 0 ? gap : 0);
  }

  // Keep a label visible even when the first tag needs to be truncated.
  return Math.max(1, visibleCount);
}
