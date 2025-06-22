import { supabase } from 'src/boot/supabase'

export async function fetchUser() {
  this.loading = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    this.user = user
    if (user) {
      await this.fetchProfile()
    }
  } catch (error) {
    console.error("Error fetching user:", error)
  } finally {
    this.loading = false
  }
}

export async function fetchProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("No authenticated user")
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()
    if (error) throw error
    this.profile = data
  } catch (error) {
    this.profile = null
    throw error
  }
}

export async function signOut() {
  try {
    await supabase.auth.signOut()
    this.user = null
    this.profile = null
  } catch (error) {
    console.error("Error signing out:", error)
  }
}

export function listenToAuthChanges() {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      this.user = session.user
      await this.fetchProfile()
    } else {
      this.user = null
      this.profile = null
    }
  })
}

export async function signUp({ email, password, ...profileFields }) {
  this.loading = true
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      ...profileFields,
    })
    if (error) throw error

    const user = data.user
    if (user) {
      await supabase.from('users').insert({
        id: user.id,
        email_address: user.email,
      })
    }
    return user
  } 
  catch (error) {
    console.error("Error signing up:", error)
    throw error
  } finally {
    this.loading = false
  }
}