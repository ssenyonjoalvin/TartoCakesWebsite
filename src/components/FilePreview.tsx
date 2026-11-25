"use client";

import { useEffect, useRef } from "react";

/** Own the preview URL for exactly as long as its image is mounted. */
export default function FilePreview({ file, alt = "", className }: {
  file: File;
  alt?: string;
  className?: string;
}) {
  const image = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const url = URL.createObjectURL(file);
    if (image.current) image.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // A local blob URL is assigned by the effect; Next image optimization is unnecessary.
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={image} alt={alt} className={className} />;
}
