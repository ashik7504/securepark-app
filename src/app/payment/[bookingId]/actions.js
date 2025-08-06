// src/app/payment/[bookingId]/actions.js
'use server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import createSupabaseServerClient from '@/lib/supabase/server';

export async function processPayment(bookingId) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  // In a real app, you would process payment with Stripe/bKash here.
  // Since this is a simulation, we just update the booking status.

  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'confirmed' })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) {
    console.error('Payment processing error:', error);
    redirect(`/payment/${bookingId}?error=Payment failed`);
  }

  redirect('/booking-success');
}