export const isAuthenticated = (state) => !!state.user
export const userName = (state) => state.profile?.full_name
export const userEmail = (state) => state.profile?.email