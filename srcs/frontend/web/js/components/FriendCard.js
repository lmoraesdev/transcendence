import helpers from "../helpers/helpers.js";
import FriendCardPopup from "../components/FriendCardPopup.js";

const { truncateUsername } = helpers;

const FriendCard = (friendCardElem) => {
  const friendCardHTML = `
    <template id="friend-card-template">
      <div class="status"></div>
      <img class="avatar rounded-4 border border-1 border-white" alt="avatar" referrerpolicy="no-referrer">
      <h6 class="text-center m-0"></h6>
    </template>
  `;

  if (!document.querySelector('#friend-card-template')) {
    const templateContainer = document.createElement('div');
    templateContainer.innerHTML = friendCardHTML;
    document.body.appendChild(templateContainer);
  }  
  
  const template = document.getElementById("friend-card-template");
  const component = template.content.cloneNode(true);

  friendCardElem.appendChild(component);
  friendCardElem.classList.add(
    "d-flex",
    "flex-column",
    "justify-content-center",
    "align-items-center",
    "py-2",
    "px-3",
    "rounded-5",
  );

  const avatar = friendCardElem.getAttribute("avatar");
  const status = friendCardElem.getAttribute("status");
  const username = friendCardElem.getAttribute("username");
  const first_name = friendCardElem.getAttribute("first-name");
  const last_name = friendCardElem.getAttribute("last-name");

  friendCardElem.querySelector("h6").textContent = truncateUsername(username);
  friendCardElem.querySelector("img").src = avatar;
  friendCardElem.querySelector(".status").style.backgroundColor = status === "ON" ? "green" : "red";

  friendCardElem.addEventListener("click", () => {
    const friend_card_popup = document.createElement("friend-card-popup");
    friend_card_popup.setAttribute("friend-card-type", friendCardElem.getAttribute("friend-card-type"));
    friend_card_popup.setAttribute("player-id", friendCardElem.getAttribute("player-id"));
    friend_card_popup.setAttribute("username", truncateUsername(username));
    friend_card_popup.setAttribute("first-name", first_name);
    friend_card_popup.setAttribute("last-name", last_name);
    friend_card_popup.setAttribute("avatar-f", avatar);

    friendCardElem.parentNode.appendChild(friend_card_popup);
  });

};

export default FriendCard;
