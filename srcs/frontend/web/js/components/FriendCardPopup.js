import fetching from "../helpers/fetching.js";

const FriendCardPopup = () => {
  const friendCardPopupHTML = `
    <template id="friend-card-popup">
      <div class="d-flex flex-column justify-content-center align-items-center rounded-5 gap-5 p-5">
        <button class="popup-close btn-close btn-close-white align-self-end"></button>
        <h1 class="popup-header"></h1>
        <img class="avatar border border-1 border-white rounded-4" alt="avatar" referrerpolicy="no-referrer">
        <h2 class="username"></h2>
        <h1><span class="first-name"></span> <span class="last-name"></span></h1>
        <div class="buttons">
          <button class="green-button btn btn-success btn-lg fw-bold"></button>
          <button class="red-button btn btn-danger btn-lg fw-bold"></button>
        </div>
      </div>
    </template>
  `;

  if (!document.querySelector('#friend-card-popup')) {
    const templateContainer = document.createElement('div');
    templateContainer.innerHTML = friendCardPopupHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("friend-card-popup");
  const component = template.content.cloneNode(true);

  const friendCardPopup = document.querySelector('friend-card-popup');
  friendCardPopup.appendChild(component);
  friendCardPopup.classList.add(
    "d-flex",
    "flex-column",
    "justify-content-center",
    "align-items-center",
    "gap-2",
  );

  const close_button = friendCardPopup.querySelector(".popup-close");
  const popup_header = friendCardPopup.querySelector(".popup-header");
  const avatar = friendCardPopup.querySelector(".avatar");
  const username = friendCardPopup.querySelector(".username");
  const first_name = friendCardPopup.querySelector(".first-name");
  const last_name = friendCardPopup.querySelector(".last-name");
  const green_button = friendCardPopup.querySelector(".green-button");
  const red_button = friendCardPopup.querySelector(".red-button");

  if (friendCardPopup.attributes["friend-card-type"].value === "friends") {
    green_button.style.display = "none";
    red_button.textContent = "Remove";
  } else if (friendCardPopup.attributes["friend-card-type"].value === "requests") {
    green_button.style.display = "none";
    red_button.textContent = "Cancel";
  } else if (friendCardPopup.attributes["friend-card-type"].value === "invites") {
    green_button.textContent = "Accept";
    red_button.textContent = "Decline";
  } else if (friendCardPopup.attributes["friend-card-type"].value === "search") {
    green_button.textContent = "Send Friend Request";
    red_button.style.display = "none";
  }

  popup_header.textContent = friendCardPopup.attributes["friend-card-type"].value.toUpperCase().slice(0, -1);
  if (friendCardPopup.attributes["friend-card-type"].value === "search") popup_header.textContent += "H";
  avatar.src = friendCardPopup.attributes["avatar"].value;
  username.textContent = friendCardPopup.attributes["username"].value;
  first_name.textContent = friendCardPopup.attributes["first-name"].value;
  last_name.textContent = friendCardPopup.attributes["last-name"].value;

  close_button.addEventListener("click", (event) => {
    friendCardPopup.parentElement.removeChild(friendCardPopup);
  });

  const friendship_ation = (action, player_id) => {
    const json = JSON.stringify({
      target_id: Number(player_id),
    });
    fetching(`https://${window.ft_transcendence_host}/player/friendship/`, action, json, {
      "Content-Type": "application/json",
    }).then((req) => {
      if (req.status === 400 && req.message.startsWith("You")) {
        alert(req.message);
        return;
      }
      const friend_list = document.querySelector(".friend-list");
      const friends_list = friend_list.querySelector("friends-list");
      friendCardPopup.parentElement.removeChild(friendCardPopup);
      friend_list.removeChild(friends_list);
      friend_list.appendChild(document.createElement("friends-list"));
    });
  };

  green_button.addEventListener("click", (event) => {
    friendship_ation("POST", friendCardPopup.attributes["player-id"].value);
  });

  red_button.addEventListener("click", (event) => {
    friendship_ation("DELETE", friendCardPopup.attributes["player-id"].value);
  });

};

export default FriendCardPopup;
