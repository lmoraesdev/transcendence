import styles from './Buttons.css'

const Button =(text) => {
    return(
        <button class={styles.button} onClick={onClick}>{text}</button>
    )
}

export default Button;