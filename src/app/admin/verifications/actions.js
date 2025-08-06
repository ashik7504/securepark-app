// src/app/admin/verifications/actions.js
'use server';

import { createServerClient } from '@supabase/ssr';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

// This is the function for viewing documents, no changes needed here.
export async function getSignedDocumentUrls(filePaths) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { cookies: { getAll: () => cookies().getAll() } }
  );
  const { data, error } = await supabase.storage
    .from('verification-documents')
    .createSignedUrls(filePaths, 60);

  if (error) throw new Error('Could not get document URLs.');
  return data;
}

// --- 👇 THIS IS THE UPDATED APPROVE FUNCTION 👇 ---
export async function approveRequest(requestId, userId) {
  const cookieStore = cookies();
  // Create a special admin client with the service_role key
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY, // Use the service role key
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) =>
          cookieStore.set({ name, value, ...options }),
        remove: (name, options) =>
          cookieStore.set({ name, value: '', ...options }),
      },
    }
  );

  // Action 1: Update the request status to 'approved'
  const { error: requestError } = await supabaseAdmin
    .from('verification_requests')
    .update({ status: 'approved' })
    .eq('id', requestId);

  if (requestError)
    throw new Error(`Failed to update request status: ${requestError.message}`);

  // Action 2: Update the user's profile to be a verified host
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ is_verified_host: true })
    .eq('id', userId);

  if (profileError)
    throw new Error(`Failed to update profile: ${profileError.message}`);

  revalidatePath('/admin/verifications');
  revalidatePath(`/listings`); // Also revalidate listing pages to show the badge
}

// This function for rejecting is the same, no changes needed.
export async function rejectRequest(formData) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => cookieStore.get(name)?.value,
        set: (name, value, options) =>
          cookieStore.set({ name, value, ...options }),
        remove: (name, options) =>
          cookieStore.set({ name, value: '', ...options }),
      },
    }
  );
  const requestId = formData.get('requestId');
  const reason = formData.get('reason');

  const { error } = await supabase
    .from('verification_requests')
    .update({ status: 'rejected', rejection_reason: reason })
    .eq('id', requestId);

  if (error) throw new Error('Failed to reject request.');
  revalidatePath('/admin/verifications');
}