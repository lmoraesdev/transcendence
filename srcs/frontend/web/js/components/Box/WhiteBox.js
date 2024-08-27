import styles from './Box.css'

const WhiteBox = () => {
    return(
        <div class={styles.whiteBox}>
            {children}
        </div>
    )
}

export default WhiteBox;