import ButtonRed from "../Button/Button-red"

const Friend = (name, src) => {
    return (
    <div class='friendCard'>
        <img src={src} alt='Foto do amigo'/>
        <div class="friendName">
            <h3>{name}</h3>
            <ButtonRed>Del</ButtonRed>
        </div>
    </div>
    )
}

export default Friend