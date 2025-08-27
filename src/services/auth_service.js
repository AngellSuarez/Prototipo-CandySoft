//service encargado de la autenticacion, registro, logout y recuperacion de contraseña

const BASE_URL = 'https://angelsuarez.pythonanywhere.com/api/auth/';

//funcion encargada de iniciar sesion 
async function login(username, password) {
    try {
        const response = await fetch(`${BASE_URL}login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                password: password
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Error al iniciar sesion')
        }

        return await response.json();
    } catch (error) {
        console.error('Error en el login:', error);
        throw error;
    }
}

async function logout() {
    try {
        const access_token = localStorage.getItem('access_token');
        const refresh_token = localStorage.getItem('refresh_token');

        if (!refresh_token) {
            console.log('No hay token para invalidar');
            return;
        }

        if (!access_token) {
            console.log('No hay access token para autenticar la petición de logout.');
            return;
        }

        const response = await fetch(`${BASE_URL}logout/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refresh_token: refresh_token,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Error al cerrar sesion:', error);
            throw new Error(error.detail || 'Error al cerrar sesión');
        }

        console.log('Sesión cerrada correctamente');
    } catch (error) {
        console.error('Error al cerrar sesion:', error);
        throw error;
    }
}

async function register(username, password, nombre, apellido, tipo_documento, numero_documento, correo, celular) {
    try {
        const response = await fetch(`${BASE_URL}register/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                password,
                nombre,
                apellido,
                tipo_documento,
                numero_documento,
                correo,
                celular
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
        }

        return await response.json();
    } catch (error) {
        console.error('Error en el registro: ', error);
        throw error; // El error ahora puede tener { correo: [...], numero_documento: [...] }
    }
}


async function solicitar_codigo_recuperacion(correo) {
    try {
        const response = await fetch(`${BASE_URL}password/reset-request/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                correo,
            }),
        });

        if (!response.ok) {
            const contentType = response.headers.get("content-type");
            let errorMessage = 'Error al solicitar el código';

            if (contentType && contentType.includes("application/json")) {
                const error = await response.json();
                errorMessage = error.detail || errorMessage;
            } else {
                const text = await response.text();
                errorMessage = text || errorMessage;
            }

            throw new Error(errorMessage);
        }

        // Opcional: puedes retornar algo si la API responde con éxito
        return await response.json().catch(() => null);

    } catch (error) {
        console.error('Error al solicitar el codigo: ', error);
        throw error;
    }
}

async function cambiar_contrasena(codigo, correo, password) {
    try {
        const response = await fetch(`${BASE_URL}password/reset-confirm/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                codigo: codigo,
                correo: correo,
                nueva_password: password
            }),
        });

        if (!response.ok) {
            const contentType = response.headers.get("content-type");
            let errorMessage = 'Error al cambiar la contraseña';

            if (contentType && contentType.includes("application/json")) {
                const error = await response.json();
                errorMessage = error.detail || errorMessage;
            } else {
                const text = await response.text();
                errorMessage = text || errorMessage;
            }
            throw new Error(errorMessage);
        }

        return await response.json().catch(() => null);
    } catch (error) {
        console.error('Error al cambiar la contraseña: ', error);
        throw error;
    }
}



export {
    login,
    logout,
    register,
    solicitar_codigo_recuperacion,
    cambiar_contrasena
}
