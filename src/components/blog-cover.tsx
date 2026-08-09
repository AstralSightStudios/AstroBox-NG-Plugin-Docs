import Image from "next/image";

interface BlogCoverProps {
  src: string;
  alt: string;
}

export function BlogCover({ src, alt }: BlogCoverProps) {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-0">
      <div data-blog-cover className="blog-cover relative mx-auto aspect-[64/27] overflow-hidden">
        <Image src={src} alt={alt} fill priority className="object-cover" sizes="100vw" />
      </div>
    </section>
  );
}
