import style from '../../../css/components/Navbar.css'
import profile from '../../../images/profile.png'

const NavBar = () => {
    const buttonSelected = false;

    const windowWidth = window.innerWidth;

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
        {windowWidth >= 576 ? 
        (<div class={style.navbar-perfil} role="button" onClick= {() => {
            buttonSelected = !buttonSelected;
        }}
            >
          <p>Nome</p><button></button>
          <img src={profile} alt="Foto do perfil" width="50px" height="50px"/>
        {buttonSelected && (<div class={style.menu-suspended}>
            <ul>
              <li><button class={style.menu-button}>Profile</button></li>
              <li><button class={style.menu-button}>Settings</button></li>
              <li><button class={style.menu-button}>
                Exit
              </button>
              </li>
            </ul>
          </div>)}
        </div>) : null
         }
      </nav>)
}

export default NavBar;