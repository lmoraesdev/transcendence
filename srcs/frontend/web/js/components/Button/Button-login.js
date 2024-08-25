import styles from './Buttons.css'

const ButtonLogin = (img, app, onClick) => {
    return (
        <button class={styles.button} onClick={onClick}>
            <img src={img} alt={alt} />
            <span>Login with {app}</span>
        </button>
    )
}

export default ButtonLogin;