import fetching from '../../helpers/fetching.js';

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById('home').addEventListener('click', () => {
    fetching(`https://${window.ft_transcendence_host}/leaderboard`);
  });

  document.getElementById('leaderboard').addEventListener('click', () => {
    window.location.href = `https://${window.ft_transcendence_host}/home`;
  });

  document.getElementById('profile').addEventListener('click', () => {
    window.location.href = `https://${window.ft_transcendence_host}/profile`;
  });

  document.getElementById('settings').addEventListener('click', () => {
    fetching(`https://${window.ft_transcendence_host}/settings`);
  });
});
