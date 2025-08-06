// src/app/review/[bookingId]/actions.js
'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import createSupabaseServerClient from '@/lib/supabase/server';

export async function submitReview(formData) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('You must be logged in.');

  const bookingId = formData.get('bookingId');
  const revieweeId = formData.get('revieweeId');
  const rating = formData.get('rating');
  const comment = formData.get('comment');
  const reviewerId = user.id;

  // 1. Insert the new review (it's not published yet)
  const { data: newReview, error: insertError } = await supabase
    .from('reviews')
    .insert({ booking_id: bookingId, reviewer_id: reviewerId, reviewee_id: revieweeId, rating, comment })
    .select()
    .single();

  if (insertError) throw new Error(`Failed to submit review: ${insertError.message}`);

  // 2. Check if the other person has already left a review
  const { data: counterpartReview, error: checkError } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', bookingId)
    .eq('reviewer_id', revieweeId) // The person we are reviewing
    .single();

  // 3. If they have, publish both reviews
  if (counterpartReview) {
    await supabase
      .from('reviews')
      .update({ is_published: true })
      .in('id', [newReview.id, counterpartReview.id]);
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}