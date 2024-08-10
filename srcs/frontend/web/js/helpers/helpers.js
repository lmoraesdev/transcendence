import router from '../router/router.js';
import { BVAmbient } from '../components/bvambient.js';

const handleNavigation = (path) => {
    router.go(path, '', 'add');
};

const executeSequentially = (secondFunction) => {
    new BVAmbient({
        selector: "#root",
        fps: 60,
        max_transition_speed: 20000,
        min_transition_speed: 8000,
        particle_number: 50,
        particle_maxwidth: 60,
        particle_minwidth: 30,
        particle_radius: 50,
        particle_opacity: true,
        particle_colision_change: false,
        particle_background: "#faf9f5",
        refresh_onfocus: false,
    });
    
    if (typeof secondFunction === "function") {
        secondFunction();
    }
}

const isAuthTokenValid = () => {
    return fetch('https://localhost/authentication/token/verify/', {
        method: 'GET',
        credentials: 'include'
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error('Erro na verificação do token');
    })
    .then(data => {
        return data.valid;
    })
    .catch(error => {
        console.error('Erro ao verificar token:', error);
        return false;
    });
}

const clearAuthToken = () => {
    document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

export default {
    handleNavigation,
    executeSequentially,
    isAuthTokenValid,
    clearAuthToken
}