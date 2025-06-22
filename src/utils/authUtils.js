import { supabase } from 'src/boot/supabase'

export async function onLogout(router) {
  localStorage.clear()
  await supabase.auth.signOut()
  router.push('/login')
}