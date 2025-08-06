import createSupabaseServerClient from '@/lib/supabase/server';
import ListingCard from '@/components/ListingCard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = createSupabaseServerClient();

  const { data: listings, error } = await supabase
    .from('listings')
    .select(`id, title, photos, price_per_hour, profiles(full_name)`)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) console.error('Error fetching listings:', error);

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Explore Parking Spaces</h1>
      {listings && listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No active listings found.</p>
        </div>
      )}
    </div>
  );
}