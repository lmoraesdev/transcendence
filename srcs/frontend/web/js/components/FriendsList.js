import fetching from "../helpers/fetching.js";
import FriendCard from '../components/FriendCard.js';

const FriendsList = () => {
  const friendsListHTML = `
    <template id="friends-list">
      <nav class="friends-tabs">
        <ul class="d-flex justify-content-center align-items-center flex-wrap p-0 m-0 gap-1">
          <li>
            <button class="px-2 friends-btn friends-list-btn">
              Friends
            </button>
          </li>
          <li>
            <button class="px-2 requests-btn friends-list-btn">
              Requests
            </button>
          </li>
          <li>
            <button class="px-2 invites-btn friends-list-btn">
              Invites
            </button>
          </li>
          <li>
            <button class="px-2 search-btn friends-list-btn">
              Search
            </button>
          </li>
        </ul>
      </nav>
      <div class="friend-cards"></div>
    </template>
  `;

  if (!document.querySelector('#friends-list')) {
    const templateContainer     = document.createElement('div');
    templateContainer.innerHTML = friendsListHTML;
    document.body.appendChild(templateContainer);
  }

  const template  = document.getElementById("friends-list");
  const component = template.content.cloneNode(true);

  const friendsList = document.querySelector('#friendsList');
  friendsList.appendChild(component);
  friendsList.classList.add(
    "d-flex",
    "justify-content-center",
    "flex-column",
    "gap-2"
  );

  const showCards = (friend_card_type) => {
    const friend_cards = friendsList.querySelector(".friend-cards");
    friend_cards.innerHTML = "";

    if (friend_card_type === "search") {
      friend_cards.appendChild(document.createElement("search-list"));
      return;
    }

    fetching(
      `https://${window.ft_transcendence_host}/player/friendship/?target=${friend_card_type}`,
    ).then((req) => {
      const arr = req.friendships;
      for (let i = 0; i < arr.length; i++) {
        const friend_card_elem = document.createElement("friend-card");
        friend_card_elem.setAttribute("friend-card-type", friend_card_type);
        friend_card_elem.setAttribute("player-id", arr[i].id);
        friend_card_elem.setAttribute("first-name", arr[i].first_name);
        friend_card_elem.setAttribute("last-name", arr[i].last_name);
        friend_card_elem.setAttribute("username", arr[i].username);
        friend_card_elem.setAttribute("avatar", arr[i].avatar);
        friend_card_elem.setAttribute("status", arr[i].status);
        friend_cards.appendChild(friend_card_elem);
      }
    });
  }

  const nav          = friendsList.querySelector("nav");
  const friends_btn  = nav.querySelector(".friends-btn");
  const requests_btn = nav.querySelector(".requests-btn");
  const invites_btn  = nav.querySelector(".invites-btn");
  const search_btn   = friendsList.querySelector(".search-btn");
  const friend_cards = friendsList.querySelector(".friend-cards");

  showCards("friends");

  friend_cards.classList.add("d-flex", "flex-wrap", "gap-1");
  friends_btn.addEventListener("click", () => {
    friends_btn.classList.add("active");
    requests_btn.classList.remove("active");
    invites_btn.classList.remove("active");
    search_btn.classList.remove("active");
    showCards("friends");
  });

  requests_btn.addEventListener("click", () => {
    friends_btn.classList.remove("active");
    requests_btn.classList.add("active");
    invites_btn.classList.remove("active");
    search_btn.classList.remove("active");
    showCards("requests");
  });

  invites_btn.addEventListener("click", () => {
    friends_btn.classList.remove("active");
    requests_btn.classList.remove("active");
    invites_btn.classList.add("active");
    search_btn.classList.remove("active");
    showCards("invites");
  });

  search_btn.addEventListener("click", () => {
    friends_btn.classList.remove("active");
    requests_btn.classList.remove("active");
    invites_btn.classList.remove("active");
    search_btn.classList.add("active");
    showCards("search");
  });

  FriendCard();
}

export default FriendsList;
