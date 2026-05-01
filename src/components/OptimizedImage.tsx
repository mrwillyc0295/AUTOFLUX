import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { getOptimizedImageUrl, getImageSrcSet } from '../lib/imageUtils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  containerClassName,
  width,
  height,
  priority = false,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Default optimization settings
  const optimizedSrc = getOptimizedImageUrl(src, { width, height });
  const srcSet = getImageSrcSet(src);

  return (
    <div className={cn("relative overflow-hidden bg-slate-800/50", containerClassName)}>
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-slate-500 text-[10px] font-bold uppercase p-4 text-center">
          Error al cargar imagen
        </div>
      ) : (
        <img
          src={optimizedSrc}
          srcSet={srcSet}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setError(true);
            console.error(`Failed to load image: ${optimizedSrc}`);
          }}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          decoding="async"
          referrerPolicy="no-referrer-when-downgrade"
          className={cn(
            "transition-all duration-700 ease-in-out w-full h-full object-cover",
            isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105 blur-sm",
            className
          )}
          {...props}
        />
      )}
    </div>
  );
};
