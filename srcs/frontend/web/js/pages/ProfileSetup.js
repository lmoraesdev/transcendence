const ProfileSetup = () => {
    const profileSetupHTML = `
    <template id="profile-setup-template">
      <div class="bg-white p-4  h-100 d-flex mx-auto mb-4">
        <div class="gap-2 col m-2">
          <div class="profile-setup-content d-grid gap-2 col m-2">
            <h1 class="text-dark text-center fs-4 my-5">Choose your avatar and nickname to start the game.</h1>
          </div>
          <div class="text-center">
            <label for="photoInput" class="d-flex justify-content-center align-items-center">
                <input id="photoInput" type="file" name="avatar" accept="image/*" class="d-none">
                <div class="position-relative" style="width: 170px; height: 170px;">
                    <img id="avatarPreview" 
                        src="https://static.vecteezy.com/system/resources/previews/047/589/492/non_2x/profile-photo-logo-sign-outline-vector.jpg" 
                        alt="Profile Photo" 
                        class="img-thumbnail rounded-circle w-100 h-100" 
                        style="object-fit: cover; cursor: pointer;">
                </div>
            </label>
            <p class="mt-3">Click on the image to change the avatar</p>
            <div class="my-3">
              <div class="input-group">
                <span class="input-group-text">Nickname</span>
                <input required type="text" id="nickname-input" class="form-control" aria-label="nickname">
              </div>
            </div>
            <div id="error-message" class="text-danger" style="display: none;"></div>
          </div>        
        </div>
        <div class="d-block col m-2 hidden-players">
          <p class="text-dark text-center fs-4 my-3">Select player</p>
          <div id="all-players" class="d-flex col-6 mx-auto">
          <!-- All Player -->
          </div>
        </div>
      </div>
    </template>
  `;
}

export default ProfileSetup;