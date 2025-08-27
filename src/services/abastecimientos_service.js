//abastecimientos service


const BASE_URL = 'https://angelsuarez.pythonanywhere.com/api/abastecimiento/abastecimientos/';

// Devuelve headers con Authorization si hay token
const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return token
        ? {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        }
        : {
            'Content-Type': 'application/json',
        };
};

export const getAbastecimientos = async () =>{
    try{
        const response = await fetch(BASE_URL,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) throw new Error("Error al listar los abastecimientos");
        return await response.json().catch(() => null);
    }catch(error){
        console.error("Error al conseguir los abastecimientos ",error)
        return [];
    }
}

export const getAbastecimiento = async (id) => {
    try{
        const response = await fetch(`${BASE_URL}${id}/`,{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if(!response.ok){
            const error = await response.json();
            throw new Error(error.detail || "Error al conseguir el abastecimiento");
        }
        return await response.json().catch(() => null)
    }catch(error){
        console.error("Error al conseguir el abastecimiento: ",error)
    }
}

export const eliminarAbastecimiento = async (id) => {
    try {
        const response = await fetch(`${BASE_URL}${id}/`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Error al eliminar el abastecimiento");
        }

        return await response.json().catch(() => null);
    } catch (error) {
        console.error("Error al eliminar el abastecimiento: ", error);
    }
}

//esta funcion es una cagada y deberia ir en insumos pero como me da una pereza ni el putas de cambiarlo lo voy a poner aqui, si quieres lo cambias pero cosa tuya pq te toca cambiar el import en el componente

export const getInsumosDisponibles = async () => {
    try {
        const response = await fetch('https://angelsuarez.pythonanywhere.com/api/insumo/insumos/',{
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if(!response.ok){
            const error = await response.json();
            throw new Error(error.detail || "Error al listar los insumos disponibles"); 
        }
        return await response.json().catch(() => null);
    }catch(error){
        console.error("Error al listar los insumos disponibles: ", error);
        return [];
    }
}

export const crearAbastecimiento = async (manicurista_id) => {
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ manicurista_id }), // Inicialmente sin insumos
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Error al crear el abastecimiento");
        }

        const data = await response.json().catch(() => null);
        if (!data || !data.id) {
            throw new Error("No se pudo obtener el ID del abastecimiento creado.");
        }
        return data;
    } catch (error) {
        console.error("Error al crear el abastecimiento: ", error);
        throw error;
    }
};
export const agregarInsumosAAbastecimiento = async (abastecimiento_id, insumos) => {
    const response = await fetch(`${BASE_URL}${abastecimiento_id}/agregar_insumos/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ insumos }),
    });

    if (!response.ok) {
        throw new Error('Error al agregar los insumos al abastecimiento');
    }

    return await response.json();
};

export const reportarInsumos = async (abastecimiento_id, insumos_reporte) => {
    const response = await fetch(`https://angelsuarez.pythonanywhere.com/api/abastecimiento/insumo-abastecimientos/realizar_reporte/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ abastecimiento_id, insumos_reporte }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al reportar insumos:", errorData);
        throw new Error("Error al reportar los insumos");
    }

    return await response.json();
};

