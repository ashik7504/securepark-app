// src/app/listings/[id]/edit/page.js
import { cookies } from 'next/headers';
import createSupabaseServerClient from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function EditListingPage({ params }) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  const { data: listing, error } = await supabase
    .from('listings')
    .select('*')
    .eq('id', params.id)
    .eq('host_id', user.id)
    .single();
  
  if (!listing) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-4xl p-8">
      <h1 className="text-3xl font-bold">Edit Listing: {listing.title}</h1>
      <p className="mt-4">Edit form coming soon...</p>
    </div>
  );
}