'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function BookingForm({ user, listing }) {
  const router = useRouter();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // This effect recalculates the price whenever the dates change
  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (end <= start) {
        setTotalPrice(0);
        setError('End time must be after start time.');
        return;
      }
      setError('');

      const durationInHours = (end - start) / (1000 * 60 * 60);
      let newPrice = 0;

      if (listing.price_per_day && durationInHours >= 24) {
        const days = Math.floor(durationInHours / 24);
        const remainingHours = durationInHours % 24;
        newPrice = days * listing.price_per_day + remainingHours * listing.price_per_hour;
      } else {
        newPrice = durationInHours * listing.price_per_hour;
      }
      setTotalPrice(newPrice.toFixed(2));
    }
  }, [startTime, endTime, listing.price_per_hour, listing.price_per_day]);

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      router.push('/auth');
      return;
    }
    if (new Date(endTime) <= new Date(startTime)) {
        setError('End time must be after start time.');
        return;
    }
    
    setIsLoading(true);
    setError('');

    // Use .select().single() to get the created record back
    const { data: newBooking, error: insertError } = await supabase.from('bookings').insert({
      renter_id: user.id,
      listing_id: listing.id,
      start_time: new Date(startTime).toISOString(),
      end_time: new Date(endTime).toISOString(),
      total_price: totalPrice,
      status: 'pending_payment',
    }).select().single(); 

    if (insertError) {
      setError(`Booking failed: ${insertError.message}`);
    } else {
      // Redirect to the payment page for the new booking
      router.push(`/payment/${newBooking.id}`);
    }

    setIsLoading(false);
  };
  
  // Get current time in YYYY-MM-DDTHH:MM format for the min attribute
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDateTime = now.toISOString().slice(0,16);

  return (
    <form onSubmit={handleBooking} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">Start Time</label>
          <input 
            type="datetime-local" 
            id="start_time" 
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            min={minDateTime}
            required 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
        <div>
          <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">End Time</label>
          <input 
            type="datetime-local" 
            id="end_time" 
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            min={startTime || minDateTime}
            required 
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>
      </div>

      {totalPrice > 0 && (
        <div className="p-4 bg-indigo-50 rounded-md text-center">
          <p className="text-sm text-gray-600">Total Price</p>
          <p className="text-2xl font-bold text-indigo-600">৳{totalPrice}</p>
        </div>
      )}

      {error && <p className="text-red-600 text-sm text-center">{error}</p>}

      <button 
        type="submit"
        disabled={isLoading || totalPrice <= 0}
        className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
      >
        {isLoading ? 'Processing...' : (user ? 'Request to Book' : 'Login to Book')}
      </button>
    </form>
  );
}