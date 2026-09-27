const API_URL = 'http://localhost:8080/api/users';

export const registerUser = async (userData) => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Error en el registro');
    }
    return response.json();
};

export const loginUser = async (credentials) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
    });

    // Leemos la respuesta como texto primero para evitar el fallo de formato
    const textData = await response.text();

    if (!response.ok) {
        throw new Error(textData || 'Credenciales incorrectas');
    }

    // Si la respuesta es exitosa, la convertimos a JSON
    return textData ? JSON.parse(textData) : {};
};