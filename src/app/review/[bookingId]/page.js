// src/app/review/[bookingId]/page.js
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { submitReview } from './actions';
import createSupabaseServerClient from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function ReviewPage({ params }) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  // --- REVISED LOGIC ---
  // 1. Fetch the booking by its ID first, without a permission check.
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, listings(host_id)')
    .eq('id', params.bookingId)
    .single();

  // If the booking doesn't exist at all, it's a 404.
  if (!booking) {
    notFound();
  }

  // 2. Now, check permissions in the code.
  const isRenter = user.id === booking.renter_id;
  const isHost = user.id === booking.listings.host_id;

  // If the current user is NOT the renter and NOT the host, they can't access this page.
  if (!isRenter && !isHost) {
    notFound();
  }

  // --- END OF REVISED LOGIC ---

  const revieweeId = isRenter ? booking.listings.host_id : booking.renter_id;

  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', params.bookingId)
    .eq('reviewer_id', user.id)
    .maybeSingle();

  if (existingReview) {
    return (
      <div className="container mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold">Thank You!</h1>
        <p className="mt-4">You have already submitted a review for this booking.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg p-8">
      <h1 className="text-3xl font-bold">Leave a Review</h1>
      <p className="mt-2 text-gray-600">Your review will be public after both parties have submitted their feedback.</p>
      <form action={submitReview} className="mt-6 space-y-6">
        <input type="hidden" name="bookingId" value={params.bookingId} />
        <input type="hidden" name="revieweeId" value={revieweeId} />
        <div>
          <label className="block text-sm font-medium text-gray-700">Rating</label>
          <div className="flex space-x-2 mt-2">
            {[1, 2, 3, 4, 5].map(star => (
              <label key={star} className="cursor-pointer">
                <input type="radio" name="rating" value={star} required className="sr-only peer" />
                <span className="text-3xl text-gray-300 peer-checked:text-yellow-400">★</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment</label>
          <textarea
            name="comment"
            id="comment"
            rows="4"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          ></textarea>
        </div>
        <button type="submit" className="w-full py-3 px-4 rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
          Submit Review
        </button>
      </form>
    </div>
  );
}