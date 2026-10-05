// Colors are expected in six-digit hex format (#RRGGBB).
export function getContrastingTextColor(
  backgroundColor: string,
  options?: { opacity: number; surfaceColor: string },
): "#FFFFFF" | "#000000" {
  const opacity = options?.opacity ?? 1;
  const luminance = [1, 3, 5].reduce((sum, offset, index) => {
    const channel = parseInt(backgroundColor.slice(offset, offset + 2), 16);
    const surfaceChannel = options
      ? parseInt(options.surfaceColor.slice(offset, offset + 2), 16)
      : channel;
    const value = (channel * opacity + surfaceChannel * (1 - opacity)) / 255;
    const linear =
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    return sum + linear * [0.2126, 0.7152, 0.0722][index];
  }, 0);

  return luminance <= 0.279 ? "#FFFFFF" : "#000000";
}
