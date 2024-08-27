import profile from '../../../images/profile.png'

const ProfileData = () => {
  return(
    <div class="profile">
      <div class="profile-data">
        <div>
            <p class="profile-text profile-number">Nome</p>
            <img class="profile-img" src={profile} alt='Foto perfil'width='150px' height='150px'/>
        </div>
        <div class="profile-statistcs">
          <div>
            <p class="profile-number">0</p>
            <p>General Rank</p>
          </div>
          <div>
            <p class="profile-number">0</p>
            <p>Ladder Victories</p>
          </div>
          <div>
            <p class="profile-number">0</p>
            <p>Score</p>
          </div>
          <div>
            <p class="profile-number">0</p>
            <p>Total Ladder Games</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileData