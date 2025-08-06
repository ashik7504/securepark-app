// src/app/dashboard/actions.js
'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import createSupabaseServerClient from '@/lib/supabase/server';

export async function toggleListingStatus(listingId, currentStatus) {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('You must be logged in to perform this action.');
  }

  const { error } = await supabase
    .from('listings')
    .update({ is_active: !currentStatus })
    .eq('id', listingId)
    .eq('host_id', user.id);

  if (error) {
    console.error('Error updating listing status:', error);
    throw new Error('Failed to update listing status.');
  }

  revalidatePath('/dashboard');
}