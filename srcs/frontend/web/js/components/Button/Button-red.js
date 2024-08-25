import styles from './Buttons.css'

const ButtonRed =(text) => {
    return(
        <button class={styles.button-red} onClick={onClick}>{text}</button>
    )
}

export default ButtonRed;