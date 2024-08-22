import style from '../../../css/components/Navbar.css'

const NavBar = () => {
    const buttonSelected = false;

    return (<nav class={style.navbar}>
        <div>
          <img src="./web/images/logo_pong.png" alt="logo pong"/>
        </div>
        <div class={style.navbar-items}>
          <ul class={style.navbar-items}>
            <li><button class={style.navbar-button}>Home</button></li>
            <li><button class={style.navbar-button}>Statistics</button></li>
            <li><button class={style.navbar-button}>Leaderboard</button></li>
            <li><button class={style.navbar-button}>Tournament</button></li>
            <li><button class={style.navbar-button}>Guilds</button></li>
          </ul>
        </div>
        <div class="navbar-perfil" role="button" onClick= {() => {
            buttonSelected = !buttonSelected;
        }}
            >
          <p>Nome</p><button></button>
          <img src="./web/images/pngegg.png" alt="Foto do perfil" width="50px" height="50px"/>
        {buttonSelected && (<div>
            <ul>
                <li>Profile</li>
                <li>Settings</li>
                <li>Exit</li>
            </ul>
        </div>)}
        </div>
      </nav>)
}

export default NavBar;