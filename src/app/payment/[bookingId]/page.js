// src/app/payment/[bookingId]/page.js
import createSupabaseServerClient from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { processPayment } from './actions';

export const dynamic = 'force-dynamic';

export default async function PaymentPage({ params }) {
  const supabase = createSupabaseServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .select('*, listings(title, address_text)')
    .eq('id', params.bookingId)
    .eq('renter_id', user.id) // Ensure user owns this booking
    .single();

  if (error || !booking) {
    notFound();
  }

  if (booking.status === 'confirmed') {
    redirect('/booking-success');
  }

  const startTime = new Date(booking.start_time).toLocaleString();
  const endTime = new Date(booking.end_time).toLocaleString();

  return (
    <div className="container mx-auto max-w-lg p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 rounded-lg shadow-md border">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirm Your Payment</h1>
        <p className="text-gray-600 mb-6">Review your booking details before paying.</p>

        <div className="space-y-4 border-t border-b py-6">
          <div>
            <h2 className="font-semibold text-lg">{booking.listings.title}</h2>
            <p className="text-sm text-gray-500">{booking.listings.address_text}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">From: <span className="font-medium text-gray-800">{startTime}</span></p>
            <p className="text-sm text-gray-500">To: <span className="font-medium text-gray-800">{endTime}</span></p>
          </div>
        </div>

        <div className="flex justify-between items-center py-6">
          <span className="text-xl font-medium">Total Amount</span>
          <span className="text-2xl font-bold text-indigo-600">৳{booking.total_price}</span>
        </div>

        <form action={processPayment.bind(null, booking.id)}>
          <button type="submit" className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            Confirm & Pay Now
          </button>
        </form>
      </div>
    </div>
  );
}