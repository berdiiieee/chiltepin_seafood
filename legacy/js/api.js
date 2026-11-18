/* === CHILTEPIN SEAFOOD — API HELPER FUNCTIONS === */

const API_BASE = 'https://backend-chiltepin.onrender.com';

async function apiGet(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || `Error ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API GET Error:', error);
        throw error;
    }
}

async function apiPost(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || `Error ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API POST Error:', error);
        throw error;
    }
}

function handleApiError(error, defaultMessage = 'Ocurrió un error. Por favor intenta nuevamente.') {
    if (error.message.includes('429')) {
        return 'Demasiadas solicitudes. Por favor espera unos minutos.';
    }
    if (error.message.includes('400')) {
        return error.message || 'Datos inválidos. Por favor verifica tu información.';
    }
    if (error.message.includes('500')) {
        return 'Error del servidor. Por favor intenta más tarde.';
    }
    return error.message || defaultMessage;
}
