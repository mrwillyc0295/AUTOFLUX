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
    // Picsum format is https://picsum.photos/seed/picsum/width/height
    // or https://picsum.photos/width/height
    // We try to replace the width/height parts
    const parts = baseUrl.split('/');
    
    // If it has a seed, it looks like: https://picsum.photos/seed/ID/W/H
    if (baseUrl.includes('/seed/')) {
      const seedIndex = parts.indexOf('seed');
      if (seedIndex !== -1 && parts.length >= seedIndex + 4) {
        parts[seedIndex + 2] = width.toString();
        parts[seedIndex + 3] = (height || Math.round(width * 0.66)).toString();
        return parts.join('/');
      }
    }

    // Default picsum: https://picsum.photos/W/H
    // We assume the last two parts are width/height if they are numbers
    const lastPart = parseInt(parts[parts.length - 1]);
    const secondLastPart = parseInt(parts[parts.length - 2]);

    if (!isNaN(lastPart) && !isNaN(secondLastPart)) {
      parts[parts.length - 2] = width.toString();
      parts[parts.length - 1] = (height || Math.round(width * 0.66)).toString();
      return parts.join('/');
    } else if (!isNaN(lastPart)) {
      // Maybe only width was provided: https://picsum.photos/W
      parts[parts.length - 1] = width.toString();
      if (height) parts.push(height.toString());
      return parts.join('/');
    }
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
