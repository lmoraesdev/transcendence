import Friend from "./Friends"

const ListFriends =() => {
    return (
    <div class="listFriends">
        <h2>All friends</h2>
      <div class="listCards">
        <Friend src='../../../images/nier.png' name='João'></Friend>
        <Friend src='../../../images/r2d2.png' name='r2d2'></Friend>
        <Friend src='../../../images/profile.png' name='C-3P0'></Friend>
      </div>
    </div>
    )  
}

export default ListFriends