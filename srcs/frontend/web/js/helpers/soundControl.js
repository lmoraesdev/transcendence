export function getSoundStatus() {
  const soundStatus = localStorage.getItem("soundEnabled") === "true" ? true : false;
  return soundStatus;
}

export function setSoundStatus(status) {
  localStorage.setItem("soundEnabled", status);
}

export function toggleSoundStatus() {
  setSoundStatus(!getSoundStatus());
}
