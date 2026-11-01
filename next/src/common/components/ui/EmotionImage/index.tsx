'use client';

import Image, { type ImageProps } from 'next/image';
import { useContext } from 'react';

import type { Emotion } from '@/common/constants/emotions';
import { SettingsContext } from '@/common/settings/SettingsContext';
import { DEFAULT_EMOTION_ICON_STYLE, type EmotionIconStyle } from '@/common/types/setting';

type EmotionImageProps = Omit<ImageProps, 'src'> & {
  emotion: Emotion;
  iconStyle?: EmotionIconStyle;
};

export default function EmotionImage({ emotion, iconStyle, alt, width = emotion.src.width, height = emotion.src.height, sizes, className, style, ...props }: EmotionImageProps) {
  const settings = useContext(SettingsContext);
  const selectedStyle = iconStyle ?? settings?.emotionIcon.style ?? DEFAULT_EMOTION_ICON_STYLE;

  if (selectedStyle !== 'basic') {
    return (
      <Image
        {...props}
        alt={alt}
        src={`/img/emotion/${selectedStyle}/${emotion.name}.png`}
        width={width}
        height={height}
        sizes={sizes ?? '64px'}
        className={className}
        style={style}
      />
    );
  }

  return (
    <Image
      {...props}
      alt={alt}
      src={emotion.src}
      width={width}
      height={height}
      sizes={sizes ?? (width === emotion.src.width ? '64px' : `${width}px`)}
      className={className}
      style={style}
    />
  );
}
