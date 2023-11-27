"use client";

import React, { CSSProperties, useEffect, useRef, useState } from "react";
import type { getImageProps } from "~/utils/getImageProps";

export function SanityImageInternal({
  alt,
  loading = "lazy",
  elProps = {},
  imageProps,
  ...props
}: {
  alt?: string;
  loading?: "lazy" | "eager";
  /**
   * If this <img> component's size is constrained in ways that force it to have a different
   * aspect-ratio than the native image, then `applyHotspot` will apply a CSS `object-position`
   * to reflect the hotspot selected by editors in Sanity.
   *
   * @see https://toolkit.tinloof.com/images
   */
  applyHotspot?: boolean;
  elProps?: Partial<
    React.DetailedHTMLProps<
      React.ImgHTMLAttributes<HTMLImageElement>,
      HTMLImageElement
    >
  >;
  imageProps?: Pick<
    React.DetailedHTMLProps<
      React.ImgHTMLAttributes<HTMLImageElement>,
      HTMLImageElement
    >,
    "src" | "srcSet" | "style" | "sizes" | "width" | "height"
  >;
} & Parameters<typeof getImageProps>[0]) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  const hotspotStyle: CSSProperties = props.applyHotspot
    ? {
        objectFit: "cover",
        objectPosition: props.image?.hotspot
          ? `${props.image?.hotspot.x * 100}% ${props.image?.hotspot.y * 100}%`
          : undefined,
      }
    : {};
  const style = { ...hotspotStyle, ...imageProps.style, ...elProps.style };

  useEffect(() => {
    // If the image was hydrated *after* it was already loaded, onload below won't be called
    // Let's make sure every loaded image is transitioned into setLoaded(true)
    if (imgRef?.current?.complete && !loaded) {
      setLoaded(true);
    }
  }, [imgRef, loaded]);

  if (!imageProps?.src) {
    return null;
  }

  return (
    // eslint-disable-next-line
    <img
      key={imageProps.src}
      ref={imgRef}
      loading={loading}
      alt={alt || props.image.alt || props.image.caption || ""}
      {...elProps}
      {...imageProps}
      style={style}
      onLoad={() => setLoaded(true)}
      onError={() => {
        setLoaded(true);
      }}
      data-loaded={loaded}
      fetchPriority={loading === "eager" ? "high" : undefined}
    />
  );
}
