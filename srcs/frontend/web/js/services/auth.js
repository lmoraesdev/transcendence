export const checkAndRefreshToken = async () => {
    try {
        const response = await fetch("/check-token", {
            method: "GET",
            credentials: "include"
        });
    
        if (response.status === 403) {
            const refreshResponse = await fetch("/refresh-token", {
                method: "POST",
                credentials: "include"
            });
    
            if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            const newToken = data.access_token;
            console.log("JWT: ", newToken);
            
            } else {
                console.error("Error when refreshing the token");
                window.location.href = "/login/";
            }
        }

    } catch (error) {
        console.error("Error verifying token", error);
    }
};

//Ajustar o refresh de token para api
  