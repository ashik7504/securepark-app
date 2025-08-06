// src/app/admin/verifications/page.js
import createSupabaseServerClient from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import VerificationRow from './VerificationRow';
import { cookies } from 'next/headers';

// 👇 Import the actions here in the server component 👇
import { getSignedDocumentUrls, approveRequest, rejectRequest } from './actions';

export const dynamic = 'force-dynamic';

export default async function AdminVerificationPage() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user?.id)
    .single();
  
  if (!profile?.is_admin) {
    notFound();
  }

  const { data: requests } = await supabase
    .from('verification_requests')
    .select('*, profiles(full_name)')
    .eq('status', 'pending');

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Admin - Host Verifications</h1>
      <div className="space-y-4">
        {requests && requests.length > 0 ? (
          requests.map(req => (
            // 👇 Pass the actions down as props here 👇
            <VerificationRow
              key={req.id}
              request={req}
              getSignedDocumentUrls={getSignedDocumentUrls}
              approveRequest={approveRequest}
              rejectRequest={rejectRequest}
            />
          ))
        ) : (
          <p>No pending verification requests.</p>
        )}
      </div>
    </div>
  );
}