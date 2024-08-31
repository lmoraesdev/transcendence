
export function getSoundStatus() {
    const soundStatus = (localStorage.getItem('soundEnabled') === 'true') ? true : false;

    console.log("Sound status: ", soundStatus);
    return soundStatus;
}

export function setSoundStatus(status) {
    localStorage.setItem('soundEnabled', status);
    console.log("Sound status set to: ", status);
    console.log("Sound status saved: ", getSoundStatus());
}

export function toggleSoundStatus() {
    setSoundStatus(!getSoundStatus());
    console.log("Sound status toggled to: ", getSoundStatus());
}
