"use client";
import Image, { ImageProps } from "next/image";
import { ComponentProps } from "./types";
import { getIconPaths } from "./constants/imagePaths";
import { useEffect, useState } from "react";

export type CryptoIconProps = Omit<ComponentProps, 'alt'> & 
  Omit<ImageProps, 'src' | 'width' | 'height' | 'alt'> & {
  name: string;
  mode?: "light" | "dark";
  fallback?: React.ReactNode;
  width?: number;
  height?: number;
  alt?: string;
  onError?: (error: Error) => void;
  onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
  placeholder?: "blur" | "empty" | undefined;
  blurDataURL?: string;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
};

export function CryptoIcon({
  name,
  mode,
  className = "",
  size = 24,
  width,
  height,
  alt,
  fallback,
  onError,
  onLoadingComplete,
  placeholder,
  blurDataURL,
  loadingComponent,
  errorComponent,
  ...imageProps
}: CryptoIconProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageError, setImageError] = useState<Error | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const iconPaths = getIconPaths(name);

  if (!iconPaths) {
    if (fallback) return <>{fallback}</>;
    const finalWidth = width ?? size;
    const finalHeight = height ?? size;
    return (
      <div
        className={"inline-flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded " + className}
        style={{ width: finalWidth, height: finalHeight }}
        title={alt || name}
      >
        {name.length > 4 ? name.substring(0, 4) : name}
      </div>
    );
  }

  const finalWidth = width ?? size;
  const finalHeight = height ?? size;

  // Avoid SSR/CSR mismatch when mode is not provided: wait until mounted
  if (!mode && !mounted) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return (
      <div
        className={"inline-block rounded bg-gray-200 dark:bg-gray-700 " + className}
        style={{ width: finalWidth, height: finalHeight }}
        aria-hidden="true"
      />
    );
  }

  const effectiveMode = mode ?? "light";
  const imageSrc = effectiveMode === "dark" ? iconPaths.darkMode : iconPaths.lightMode;

  const handleError = () => {
    const error = new Error("Failed to load image: " + imageSrc);
    setImageError(error);
    setImageState('error');
    if (onError) onError(error);
  };

  const handleLoadingComplete = (result: { naturalWidth: number; naturalHeight: number }) => {
    setImageState('loaded');
    if (onLoadingComplete) onLoadingComplete(result);
  };

  if (imageState === 'loading' && loadingComponent) return <>{loadingComponent}</>;
  if (imageState === 'error') {
    if (errorComponent) return <>{errorComponent}</>;
    if (fallback) return <>{fallback}</>;
    return (
      <div
        className={"inline-flex items-center justify-center bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 text-xs font-medium rounded border border-red-300 dark:border-red-700 " + className}
        style={{ width: finalWidth, height: finalHeight }}
        title={"Error loading " + (alt || name)}
      >
        ❌
      </div>
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt || name}
      width={finalWidth}
      height={finalHeight}
      className={"transition-all duration-200 " + className}
      onError={handleError}
      onLoadingComplete={handleLoadingComplete}
      placeholder={placeholder}
      blurDataURL={blurDataURL}
      style={{ width: finalWidth + 'px!important', height: finalHeight + 'px!important' }}
      {...imageProps}
    />
  );
}
