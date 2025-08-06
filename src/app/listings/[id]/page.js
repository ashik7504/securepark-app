import createSupabaseServerClient from '@/lib/supabase/server';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import BookingForm from '@/components/BookingForm';

// This tells Next.js to re-fetch this page on every request.
export const dynamic = 'force-dynamic';

export default async function ListingDetailPage({ params }) {
  const supabase = createSupabaseServerClient();

  // Fetch the specific listing by its ID
  const { data: listing, error } = await supabase
    .from('listings')
    .select(
      `
      *,
      profiles ( full_name, avatar_url, created_at, is_verified_host )
    `
    )
    .eq('id', params.id)
    .single(); // .single() fetches one record, or returns an error if not found

  // If no listing is found, show the 404 page
  if (!listing) {
    notFound();
  }

  // Fetch reviews for the host
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('*, profiles!reviews_reviewer_id_fkey(full_name, avatar_url)')
    .eq('reviewee_id', listing.host_id) // Get reviews FOR this host
    .eq('is_published', true); // Only get published reviews

  // Get the current user to pass to the booking form
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const hostJoinedDate = new Date(listing.profiles.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content (Left Column) */}
        <div className="lg:col-span-2">
          {/* Image Gallery */}
          <div className="mb-6">
            <div className="relative w-full h-96 rounded-lg overflow-hidden mb-2">
              <Image
                src={listing.photos[0]}
                alt={listing.title}
                fill
                priority
                className="object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {listing.photos.slice(1, 5).map((photo, index) => (
                <div key={index} className="relative h-20 rounded-md overflow-hidden">
                  <Image
                    src={photo}
                    alt={`${listing.title} photo ${index + 2}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Listing Details */}
          <div className="border-t pt-6">
            <h1 className="text-3xl font-bold text-gray-900">{listing.title}</h1>
            <p className="text-md text-gray-700 mt-2">{listing.address_text}</p>
          </div>

          <div className="border-t my-6 pt-6">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold">Hosted by {listing.profiles.full_name}</h2>
              {listing.profiles.is_verified_host && (
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  ✔ Verified Host
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">Joined in {hostJoinedDate}</p>
            <p className="mt-4 text-gray-800">{listing.description}</p>
          </div>

          {/* Reviews Section */}
          <div className="border-t my-6 pt-6">
            <h2 className="text-xl font-semibold mb-4">Reviews</h2>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id}>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{review.profiles.full_name}</p>
                      <div className="flex text-yellow-400">
                        {[...Array(review.rating)].map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="mt-2 text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reviews yet.</p>
            )}
          </div>
        </div>

        {/* Booking Form (Right Column) */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 bg-white p-6 rounded-lg shadow-lg border">
            <p className="text-2xl font-bold">
              ৳{listing.price_per_hour} <span className="text-lg font-normal text-gray-600">/ hour</span>
            </p>
            <div className="border-t my-4"></div>

            <BookingForm user={user} listing={listing} />
          </div>
        </aside>
      </div>
    </div>
  );
}