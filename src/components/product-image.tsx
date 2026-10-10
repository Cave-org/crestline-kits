import Image from "next/image";
import clsx from "clsx";

export function ProductImage({
  src,
  alt,
  className,
  sizes = "(min-width: 1024px) 25vw, 50vw",
  priority,
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) {
    return <div className={clsx("bg-tile", className)} aria-label={alt} />;
  }
  return (
    <div className={clsx("relative overflow-hidden bg-tile", className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={src.endsWith(".svg")}
        className="object-contain"
      />
    </div>
  );
}
