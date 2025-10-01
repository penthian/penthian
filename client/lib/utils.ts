import { maxDescriptionLength } from '@/app/utils/constants';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type GetDisplayTextParams = {
  text: string;
  showFull?: boolean;
  maxLength?: number;
};

export const getDisplayText = ({
  text,
  showFull = false,
  maxLength = maxDescriptionLength,
}: GetDisplayTextParams): string => {
  if (!text) return "";
  if (showFull || text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + "...";
};

export function formatNumber(value: number | string): string {
  return Number(value).toLocaleString("en-US");
}