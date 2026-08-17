import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/data/cakes";

type Props = {
  cake: {
    slug: string;
    name: string;
    price: number;
    image: string;
  };
};

export default function CakeCard({ cake }: Props) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-black/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(214,40,40,0.12)]">
      <Link href={`/cakes/${cake.slug}`} className="relative block aspect-[4/5] overflow-hidden">
        <Image
          src={cake.image}
          alt={cake.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover object-center transition duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4 text-center">
        <h3 className="text-lg font-bold text-tarto-ink">{cake.name}</h3>
        <p className="mt-1 text-sm font-semibold text-tarto-red">
          {formatPrice(cake.price)}
        </p>
        <Link
          href={`/cakes/${cake.slug}`}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-tarto-red px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-tarto-red/90"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
