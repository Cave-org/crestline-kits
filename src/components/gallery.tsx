"use client";

import { useState } from "react";
import clsx from "clsx";
import { ProductImage } from "./product-image";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [""];
  return (
    <div>
      <ProductImage
        src={list[active]}
        alt={alt}
        priority
        sizes="(min-width: 1024px) 55vw, 100vw"
        className="aspect-square w-full rounded-lg"
      />
      {list.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {list.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              aria-label={`Show image ${i + 1}`}
              className={clsx(
                "overflow-hidden rounded-md border-2 transition",
                i === active ? "border-ink" : "border-transparent hover:border-line",
              )}
            >
              <ProductImage src={src} alt="" sizes="15vw" className="aspect-square" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
