import fetching from "../helpers/fetching.js";

const SearchList = () => {
  const searchListHTML = `
    <template id="search-list">
      <div class="d-flex flex-wrap justify-content-center align-items-center p-0 m-0 gap-1">
        <input class="search-input px-2 py-1 rounded-3" type="text">
        <button class="search-btn btn fw-bold rounded-5">SEARCH</button>
      </div>
      <div class="search-results d-flex flex-wrap text-center gap-1"></div>
    </template>
  `;

  if (!document.querySelector('#search-list')) {
    const templateContainer     = document.createElement('div');
    templateContainer.innerHTML = searchListHTML;
    document.body.appendChild(templateContainer);
  }

  const template = document.getElementById("search-list");
  const component = template.content.cloneNode(true);

  const searchList = document.querySelector('#searchList') // inclua a div com o id e realize o importe para utilizar
  searchList.appendChild(component);
  searchList.classList.add("w-100");

  const search_input = searchList.querySelector(".search-input");
  const search_btn = searchList.querySelector(".search-btn");
  const search_results = searchList.querySelector(".search-results");

  search_btn.addEventListener("click", () => {
    search_results.innerHTML = "";
    fetching(
      `https://${window.ft_transcendence_host}/player/?username=${search_input.value}`,
    ).then((req) => {
      const arr = req.players;
      if (!arr || arr.length === 0) {
        search_results.textContent = "No results found";
        return;
      }
      for (let i = 0; i < arr.length; i++) {
        const player_card_elem = document.createElement("friend-card");
        player_card_elem.setAttribute("friend-card-type", "search");
        player_card_elem.setAttribute("player-id", arr[i].id);
        player_card_elem.setAttribute("username", arr[i].username);
        player_card_elem.setAttribute("first-name", arr[i].first_name);
        player_card_elem.setAttribute("last-name", arr[i].last_name);
        player_card_elem.setAttribute("avatar", arr[i].avatar);
        player_card_elem.setAttribute("status", arr[i].status);
        search_results.appendChild(player_card_elem);
      }
    });
  });
};

export default SearchList;
