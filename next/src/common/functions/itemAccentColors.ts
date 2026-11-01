export function itemAccentColors(color: string, surface: string, mode: 'light' | 'dark') {
  const blend = (foreground: string, background: string, amount: number) =>
    '#' +
    [1, 3, 5]
      .map((offset) =>
        Math.round(
          parseInt(foreground.slice(offset, offset + 2), 16) * amount +
            parseInt(background.slice(offset, offset + 2), 16) * (1 - amount),
        )
          .toString(16)
          .padStart(2, '0'),
      )
      .join('');
  const luminance = (hex: string) =>
    [1, 3, 5]
      .map((offset) => {
        const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      })
      .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  const background = blend(color, surface, mode === 'dark' ? 0.16 : 0.08);
  let text = color;
  for (let step = 0; step <= 20; step += 1) {
    const amount = step / 20;
    text = blend(mode === 'dark' ? '#ffffff' : '#000000', color, amount);
    const foreground = luminance(text);
    if (
      [surface, background].every((base) => {
        const backdrop = luminance(base);
        return (
          (Math.max(foreground, backdrop) + 0.05) / (Math.min(foreground, backdrop) + 0.05) >= 4.5
        );
      })
    )
      break;
  }
  return { color, background, border: blend(color, surface, 0.3), text };
}
