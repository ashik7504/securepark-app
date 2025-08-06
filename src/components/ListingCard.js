import Image from 'next/image';
import Link from 'next/link';

export default function ListingCard({ listing }) {
  // Use the first photo as the cover image, or a placeholder if no photos exist
  const coverImage = listing.photos?.[0] || '/placeholder.png';
  const hostName = listing.profiles?.full_name || 'Anonymous Host';

  return (
    <Link href={`/listings/${listing.id}`}>
      <div className="group block border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="relative w-full h-48">
          <Image
            src={coverImage}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="p-4 bg-white">
          <h3 className="text-lg font-bold text-gray-900 truncate">{listing.title}</h3>
          <p className="text-sm text-gray-600 mt-1">Hosted by {hostName}</p>
          <p className="text-md font-semibold text-indigo-600 mt-2">
            ৳{listing.price_per_hour} <span className="text-sm font-normal text-gray-500">/ hour</span>
          </p>
        </div>
      </div>
    </Link>
  );
}