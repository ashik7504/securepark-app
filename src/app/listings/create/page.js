import { redirect } from 'next/navigation';
import CreateListingForm from './CreateListingForm';
import createSupabaseServerClient from '@/lib/supabase/server';

export default async function CreateListingPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a New Listing</h1>
        <p className="text-gray-600 mb-6">Fill out the details below to list your parking space.</p>
        <CreateListingForm user={user} />
      </div>
    </div>
  );
}