// src/components/BookingList.js
import Link from 'next/link';

export default function BookingList({ title, bookings, viewType }) {
  if (!bookings || bookings.length === 0) {
    // Don't render the section if there are no bookings for this category
    return null;
  }

  const formatDate = (dateString) => new Date(dateString).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit'
  });

  return (
    <div className="mb-8">
      <h3 className="text-xl font-medium text-gray-800 mb-3">{title}</h3>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white p-4 border rounded-lg shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2">
                <h4 className="font-semibold text-indigo-600">
                  {viewType === 'renter' ? booking.listings.title : `Booking by ${booking.profiles.full_name}`}
                </h4>
                <p className="text-sm text-gray-600">
                  From: <span className="font-medium text-gray-800">{formatDate(booking.start_time)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  To: <span className="font-medium text-gray-800">{formatDate(booking.end_time)}</span>
                </p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm text-gray-500">Total</p>
                <p className="font-bold text-lg">৳{booking.total_price}</p>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status.replace('_', ' ')}
                </span>
              </div>
            </div>

            {title === 'Completed' && (
              <div className="border-t mt-4 pt-4">
                <Link
                  href={`/review/${booking.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Leave a Review
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}