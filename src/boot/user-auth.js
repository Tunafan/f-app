import { useUserStore } from 'src/store/users'

export default async () => {
  const userStore = useUserStore()
  userStore.listenToAuthChanges()  
  await userStore.fetchUser()
}