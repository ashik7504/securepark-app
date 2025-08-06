// src/app/admin/verifications/page.js
import createSupabaseServerClient from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import VerificationRow from './VerificationRow';

export const dynamic = 'force-dynamic';

export default async function AdminVerificationPage() {
  const supabase = createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch user profile to check for admin status
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user?.id)
    .single();

  // Protect the route - only admins can access
  if (!profile?.is_admin) {
    notFound();
  }

  // Fetch all pending verification requests
  const { data: requests } = await supabase
    .from('verification_requests')
    .select('*, profiles(full_name)')
    .eq('status', 'pending');

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Admin - Host Verifications</h1>
      <div className="space-y-4">
        {requests && requests.length > 0 ? (
          requests.map(req => <VerificationRow key={req.id} request={req} />)
        ) : (
          <p>No pending verification requests.</p>
        )}
      </div>
    </div>
  );
}