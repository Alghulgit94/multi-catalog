"use client"

import { useState } from "react"
import { PLACEHOLDER_IMAGE_URL } from "@/lib/catalog-config"

interface ProductGalleryProps {
  images: string[]
  altText: string
}

export function ProductGallery({ images, altText }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const firstImage = images[0] ?? PLACEHOLDER_IMAGE_URL
  const currentImage = images[activeIndex] ?? firstImage

  return (
    <>
      <div className="product-detail__main-image-wrap" id="product-main-image-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImage}
          alt={altText}
          className="product-detail__main-image"
          id="product-main-image"
        />
      </div>

      {images.length > 1 && (
        <div className="product-detail__thumbs" id="product-thumbs">
          {images.map((src, i) => (
            <button
              key={i}
              className={`product-detail__thumb${i === activeIndex ? " product-detail__thumb--active" : ""}`}
              data-index={i}
              aria-label={`Imagen ${i + 1}`}
              onClick={() => setActiveIndex(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={`${altText} — vista ${i + 1}`} loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </>
  )
}
