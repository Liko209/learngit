export const sizeMap = {
  small: 16,
  medium: 20,
  large: 24,
  xlarge: 36,
};

export type IconButtonSize = 'small' | 'medium' | 'large' | 'xlarge';

export default function sizing(size: IconButtonSize, rate: number = 1) {
  const sizeVal = sizeMap[size];
  return `${sizeVal * rate}px`;
}
