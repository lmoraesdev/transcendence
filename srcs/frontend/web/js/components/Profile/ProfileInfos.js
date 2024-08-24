const ProfileInfos = () => {
    return(
    <div class='profile-infos'>
      <input type="radio" name="option" value="guild" id="guild" checked>
        <label for="guild" class="profile-option">Guilds</label>
      </input>
      <input type="radio" name="option" value="achievements"  id="achievements">
        <label for="achievements" class="profile-option">Achievements</label>
      </input>
      <input type="radio" name="option" value="friends"  id="friends">
        <label for="friends" class="profile-option">Friends</label>
      </input>
    </div>
  )
}

export default ProfileInfos;