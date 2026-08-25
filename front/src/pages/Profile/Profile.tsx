import { useParams } from 'react-router-dom'
import MyProfile from './MyProfile.tsx'
import OtherUserProfile from './OtherUserProfile.tsx'

function Profile() {
  const { userId } = useParams<{ userId?: string }>()
  return userId ? <OtherUserProfile userId={userId} /> : <MyProfile />
}

export default Profile
