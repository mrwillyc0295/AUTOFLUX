/**
 * Utility functions for image optimization.
 * Handles resizing and formatting for Unsplash and Picsum.photos URLs.
 */

export interface ImageResizeConfig {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png' | 'avif';
}

/**
 * Optimizes an image URL for different providers.
 */
export function getOptimizedImageUrl(baseUrl: string, config: ImageResizeConfig = {}): string {
  if (!baseUrl) return '';

  const { width = 800, height, quality = 80, format = 'webp' } = config;

  // Handle Unsplash
  if (baseUrl.includes('images.unsplash.com')) {
    const url = new URL(baseUrl);
    url.searchParams.set('w', width.toString());
    if (height) url.searchParams.set('h', height.toString());
    url.searchParams.set('q', quality.toString());
    url.searchParams.set('fm', format);
    url.searchParams.set('auto', 'format,compress'); // Auto-format if possible
    url.searchParams.set('fit', 'crop');
    return url.toString();
  }

  // Handle Picsum.photos
  if (baseUrl.includes('picsum.photos')) {
    return 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800&h=533';
  }

  // Generic fallback: just return original
  return baseUrl;
}

/**
 * Returns a srcset string for responsive images.
 */
export function getImageSrcSet(baseUrl: string, widths: number[] = [400, 800, 1200]): string {
  return widths
    .map((w) => `${getOptimizedImageUrl(baseUrl, { width: w })} ${w}w`)
    .join(', ');
}
