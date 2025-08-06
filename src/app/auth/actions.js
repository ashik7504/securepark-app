// src/app/auth/actions.js
'use server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import createSupabaseServerClient from '@/lib/supabase/server';

export async function logout() {
  const cookieStore = cookies();
  const supabase = createSupabaseServerClient(cookieStore);
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
}