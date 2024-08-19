const FriendCard = () => {
  const friendCardHTML = `
    <template id="friend-card">
      <div class="status"></div>
      <img class="avatar rounded-4 border border-1 border-white" alt="avatar" referrerpolicy="no-referrer">
      <h6 class="text-center m-0"></h6>
    </template>
  `;

  if (!document.querySelector('#friend-card')) {
    const templateContainer = document.createElement('div');
    templateContainer.innerHTML = friendCardHTML;
    document.body.appendChild(templateContainer);
  }  
  
  const template = document.getElementById("friend-card");
  const component = template.content.cloneNode(true);

  const friendCard = document.querySelector('friend-card');
  friendCard.appendChild(component);
  friendCard.classList.add(
    "d-flex",
    "flex-column",
    "justify-content-center",
    "align-items-center",
    "py-2",
    "px-3",
    "rounded-5",
  );

  const player_id = friendCard.attributes["player-id"].value;
  const username = friendCard.attributes["username"].value;
  const first_name = friendCard.attributes["first-name"].value;
  const last_name = friendCard.attributes["last-name"].value;
  const avatar = friendCard.attributes["avatar"].value;
  const status = friendCard.attributes["status"].value;

  friendCard.querySelector("h6").textContent = username;
  friendCard.querySelector("img").src = avatar;
  friendCard.querySelector(".status").style.backgroundColor = status === "ON" ? "green" : "red";

  friendCard.addEventListener("click", () => {
    const friend_card_popup = document.createElement("friend-card-popup");
    friend_card_popup.setAttribute("friend-card-type", friendCard.attributes["friend-card-type"].value);
    friend_card_popup.setAttribute("player-id", friendCard.attributes["player-id"].value);
    friend_card_popup.setAttribute("username", username);
    friend_card_popup.setAttribute("first-name", first_name);
    friend_card_popup.setAttribute("last-name", last_name);
    friend_card_popup.setAttribute("avatar", avatar);

    friendCard.parentNode.appendChild(friend_card_popup);
  });
};

export default FriendCard;
