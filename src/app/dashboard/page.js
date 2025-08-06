import createSupabaseServerClient from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import BookingList from '@/components/BookingList';
import HostListingRow from '@/components/HostListingRow';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const userId = user.id;

  // Add this fetch for the user's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_verified_host')
    .eq('id', userId)
    .single();

  // Fetch bookings where the current user is the RENTER
  const { data: renterBookings, error: renterError } = await supabase
    .from('bookings')
    .select('*, listings(*)')
    .eq('renter_id', userId)
    .order('start_time', { ascending: false });

  // Fetch bookings where the current user is the HOST
  // This requires a join through the listings table
  const { data: hostBookings, error: hostError } = await supabase
    .from('bookings')
    .select('*, listings!inner(host_id), profiles!bookings_renter_id_fkey(full_name)')
    .eq('listings.host_id', userId)
    .order('start_time', { ascending: false });

  // Fetch listings where the current user is the HOST
  const { data: hostListings, error: listingsError } = await supabase
    .from('listings')
    .select('*')
    .eq('host_id', userId)
    .order('created_at', { ascending: false });

  if (renterError || hostError || listingsError || profileError) {
    console.error('Error fetching dashboard data:', renterError || hostError || listingsError || profileError);
  }

  // Helper function to categorize bookings
  const categorizeBookings = (bookings) => {
    const now = new Date();
    const upcoming = [];
    const inProgress = [];
    const completed = [];

    bookings?.forEach(booking => {
      const startTime = new Date(booking.start_time);
      const endTime = new Date(booking.end_time);

      if (endTime < now) {
        completed.push(booking);
      } else if (startTime > now) {
        upcoming.push(booking);
      } else {
        inProgress.push(booking);
      }
    });
    return { upcoming, inProgress, completed };
  };

  const myBookings = categorizeBookings(renterBookings);
  const myListingBookings = categorizeBookings(hostBookings);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>

      {!profile?.is_verified_host && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <Link href="/verify" className="font-semibold text-blue-600 hover:underline">
            Become a Verified Host to increase trust and get more bookings! →
          </Link>
        </div>
      )}

      {/* Renter's Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">My Bookings (as Renter)</h2>
        {renterBookings && renterBookings.length > 0 ? (
          <>
            <BookingList title="In Progress" bookings={myBookings.inProgress} viewType="renter" />
            <BookingList title="Upcoming" bookings={myBookings.upcoming} viewType="renter" />
            <BookingList title="Completed" bookings={myBookings.completed} viewType="renter" />
          </>
        ) : (
          <p className="text-gray-500">You haven't booked any spaces yet.</p>
        )}
      </section>

      {/* Host's Bookings Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">Bookings on My Listings (as Host)</h2>
        {hostBookings && hostBookings.length > 0 ? (
          <>
            <BookingList title="In Progress" bookings={myListingBookings.inProgress} viewType="host" />
            <BookingList title="Upcoming" bookings={myListingBookings.upcoming} viewType="host" />
            <BookingList title="Completed" bookings={myListingBookings.completed} viewType="host" />
          </>
        ) : (
          <p className="text-gray-500">You don't have any bookings on your listings yet.</p>
        )}
      </section>
      
      {/* Host's Listings Management Section */}
      <section>
        <h2 className="text-2xl font-semibold border-b pb-2 mb-4">My Listings Management</h2>
        {hostListings && hostListings.length > 0 ? (
          <div className="space-y-3">
            {hostListings.map(listing => (
              <HostListingRow key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">You haven't created any listings yet.</p>
        )}
      </section>
    </div>
  );
}