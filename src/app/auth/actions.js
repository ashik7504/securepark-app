'use server';
import { revalidatePath } from 'next/cache';
import createSupabaseServerClient from '@/lib/supabase/server';

export async function logout() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
}