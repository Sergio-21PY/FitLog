const API_URL = 'http://localhost:8080/api/exercises';

export const getExercises = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Error al cargar la rutina.');
    return response.json();
};

export const createExercise = async (exerciseData) => {
    const token = localStorage.getItem('token');
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(exerciseData)
    });
    if (!response.ok) throw new Error('Error al registrar el ejercicio.');
    return response.json();
};

export const deleteExercise = async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Error al eliminar el ejercicio.');
};