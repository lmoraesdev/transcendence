const Modal = () => {
  const modalHTML = `
  <template id="modal-template">
    <div class="modal fade" id="modalGame" tabindex="-1" aria-labelledby="modalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalLabel">Pong</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
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
                  <span class="input-group-text">Nickname</span>
                  <input required type="text" id="nickname-input" class="form-control" aria-label="nickname">
                </div>
              </div>
              <div id="error-message" class="text-danger" style="display: none;"></div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" id="saveChangesButton">Save changes</button>
          </div>
        </div>
      </div>
    </div>
    </template>
  `;

  if (!document.querySelector('#modal-template')) {
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
  }

  const template = document.getElementById('modal-template');
  const component = template.content.cloneNode(true);

  const parentElement = document.querySelector('#modalGame');
  parentElement.appendChild(component);

  //const modalElement = document.getElementById('modalGame'); // Obtém a instância correta do modal
  //const modal = new bootstrap.Modal(modalElement); // Inicializa o modal

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

    fetch(`https://${window.ft_transcendence_host}/player/`, {
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
          return fetch(`https://${window.ft_transcendence_host}/player/avatar/`, {
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
      modal.hide();
    })
    .catch(error => {
      console.error('Error:', error);
      errorMessage.textContent = 'An error occurred. Please try again.';
      errorMessage.style.display = 'block';
    });
  });

  /*const showModal = () => {
    modal.show();
  };

  window.showModal = showModal;*/
};

export default Modal;
