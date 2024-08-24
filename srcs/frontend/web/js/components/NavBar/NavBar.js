import style from '../../../css/components/Navbar.css'

const NavBar = () => {
    return (<nav class={style.navbar}>
        <div>
          <img src="./web/images/logo_pong.png" alt="logo pong"/>
        </div>
        <div class={style.navbar-items}>
          <input type='radio' name='navbar' value='home' id='home'><label for='home' class={style.navbar-button}>Home</label></input>
          <input type='radio' name='navbar' value='leaderboard' id='leaderboard'><label for='leaderboard' class={style.navbar-button}>Leaderboard</label></input>
          <input type='radio' name='navbar' value='profile' id='profile'><label for='profile' class={style.navbar-button}>Profile</label></input>
          <input type='radio' name='navbar' value='settings' id='settings'><label for='settings' class={style.navbar-button}>Settings</label></input>
        </div>
      </nav>)
}

export default NavBar;