import style from '../../../css/components/Navbar.css'

const NavBar = () => {
    return (<nav class={style.navbar}>
        <div>
          <img src="./web/images/logo_pong.png" alt="logo pong"/>
        </div>
        <div class={style.navbar-items}>
          <input type='radio' name='navbar' value='home' id='home'><label for='home' class={style.navbar-button}>Home</label></input>
          <input type='radio' name='navbar' value='statistics' id='statistics'><label for='statistics' class={style.navbar-button}>Statistcs</label></input>
          <input type='radio' name='navbar' value='leaderboard' id='leaderboard'><label for='leaderboard' class={style.navbar-button}>Leaderboard</label></input>
          <input type='radio' name='navbar' value='tournament' id='tournament'><label for='tournament' class={style.navbar-button}>Tournament</label></input>
          <input type='radio' name='navbar' value='guilds' id='guilds'><label for='guilds' class={style.navbar-button}>Guilds</label></input>
        </div>
      </nav>)
}

export default NavBar;