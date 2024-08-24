import Friend from "./Friends"
import ListFriends from "./ListFriends"
import ProfileData from "./ProfileData"


const ProfilePage = () => {
    return(
      <div class="profile">
        <ProfileData></ProfileData>
        <ListFriends></ListFriends>
      </div>
    )
  }
  
  export default ProfilePage