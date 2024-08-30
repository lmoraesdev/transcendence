const CreateTournamentPage = () => {
  const createTournamentHTML = `
    <template id="game-settings-template">
      <section class="container-fluid justify-content-center p-3">
        <header class="text-center">
          <h1 class="display-5 fw-bold mb-4">Game Settings</h1>
        </header>
        <p>Enter a name for the tournament</p>
      </section>

      <section class="col game-settings" id="game-settings" tabindex="-1" aria-labelledby="game-settingsLabel" aria-hidden="true">
        <div class="game-settings-dialog" role="dialog" aria-modal="true">
          <div class="game-settings-content">
            <header class="game-settings-header">
              <h2 class="game-settings-title" id="game-settingsLabel">Pong</h2>
              <button type="button" class="btn-close" data-bs-dismiss="game-settings" aria-label="Close"></button>
            </header>
            <div class="game-settings-body">
              <p>Choose your avatar and nickname to start the game.</p>
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
                    <label for="nickname-input" class="input-group-text">Nickname</label>
                    <input required type="text" id="nickname-input" class="form-control" aria-label="nickname">
                  </div>
                </div>
                <div id="error-message" class="text-danger" style="display: none;"></div>
              </div>
            </div>
            <footer class="game-settings-footer">
              <button type="button" class="btn btn-primary" id="saveChangesButton">Save changes</button>
            </footer>
          </div>
        </div>
      </section>
    </template>
  `;

  if (!document.querySelector('#game-settings-template')) {
    const templateContainer = document.createElement('div');
    templateContainer.innerHTML = createTournamentHTML;
    document.body.appendChild(templateContainer);
  }

  const parentElement = document.createElement('game-settings-template');
  const template = document.getElementById('game-settings-template');
  const component = template.content.cloneNode(true);

  parentElement.appendChild(component);

  document.body.appendChild(parentElement);

  const photoInput = document.getElementById('photoInput');
  const avatarPreview = document.getElementById('avatarPreview');
  const saveChangesButton = document.getElementById('saveChangesButton');
  const nicknameInput = document.getElementById('nickname-input');
  const errorMessage = document.getElementById('error-message');

  photoInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        avatarPreview.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  avatarPreview.addEventListener('click', () => {
    photoInput.click();
  });

  saveChangesButton.addEventListener('click', () => {
    const nickname = nicknameInput.value.trim();
    if (nickname.length === 0 || nickname.length > 8) {
      errorMessage.textContent = 'Invalid nickname length. It must be between 1 and 8 characters.';
      errorMessage.style.display = 'block';
      return;
    }

    const formData = new FormData();
    if (photoInput.files.length > 0) {
      formData.append('avatar', photoInput.files[0]);
    }

    const playerData = {
      username: nickname,
    };

    fetch('https://localhost/player/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ player: playerData }),
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.status === 200) {
        if (photoInput.files.length > 0) {
          return fetch('https://localhost/player/avatar/', {
            method: 'POST',
            body: formData,
            credentials: 'include'
          }).then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          });
        } else {
          return Promise.resolve();
        }
      } else {
        throw new Error('Error updating user');
      }
    })
    .then(() => {
      game-settings.hide();
    })
    .catch(error => {
      console.error('Error:', error);
      errorMessage.textContent = 'An error occurred. Please try again.';
      errorMessage.style.display = 'block';
    });
  });
  
};

export default CreateTournamentPage;
