import React, { useState, useEffect } from 'react';
import { getExercises, createExercise, deleteExercise } from '../services/exerciseService';
import WorkoutSession from './WorkoutSession'; // Importamos el módulo de entrenamiento
import './Dashboard.css';

export default function Dashboard({ setToken }) {
    const [exercises, setExercises] = useState([]);
    const [form, setForm] = useState({
        name: '',
        muscleGroup: '',
        repetitions: '',
        sets: '',
        restBetweenReps: '',
        restBetweenSets: '',
        week: 'Semana 1',
        day: 'Lunes'
    });
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Estado para navegar hacia el módulo de entrenamiento activo
    const [activeWorkout, setActiveWorkout] = useState(null); // { weekName, dayName, exercises }

    useEffect(() => {
        loadExercises();
    }, []);

    const loadExercises = async () => {
        try {
            setLoading(true);
            const data = await getExercises();
            setExercises(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await deleteExercise(editingId);
            }
            await createExercise(form);
            setForm({
                name: '',
                muscleGroup: '',
                repetitions: '',
                sets: '',
                restBetweenReps: '',
                restBetweenSets: '',
                week: 'Semana 1',
                day: 'Lunes'
            });
            setEditingId(null);
            loadExercises();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEdit = (ex) => {
        setForm({
            name: ex.name,
            muscleGroup: ex.muscleGroup,
            repetitions: ex.repetitions,
            sets: ex.sets,
            restBetweenReps: ex.restBetweenReps,
            restBetweenSets: ex.restBetweenSets,
            week: ex.week,
            day: ex.day || 'Lunes'
        });
        setEditingId(ex.id);
    };

    const handleDelete = async (id) => {
        try {
            await deleteExercise(id);
            loadExercises();
        } catch (err) {
            setError(err.message);
        }
    };

    // Si el usuario seleccionó entrenar un día, mostramos el módulo principal de entrenamiento
    if (activeWorkout) {
        return (
            <WorkoutSession
                weekName={activeWorkout.weekName}
                dayName={activeWorkout.dayName}
                exercises={activeWorkout.exercises}
                onBack={() => setActiveWorkout(null)}
            />
        );
    }

    // Agrupar ejercicios por Semana y Día
    const groupedByWeekAndDay = exercises.reduce((acc, ex) => {
        const weekKey = ex.week || 'Semana 1';
        const dayKey = ex.day || 'Lunes';
        if (!acc[weekKey]) acc[weekKey] = {};
        if (!acc[weekKey][dayKey]) acc[weekKey][dayKey] = [];
        acc[weekKey][dayKey].push(ex);
        return acc;
    }, {});

    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>FitLog - Panel de Creación de Rutinas</h2>
                <button onClick={() => { localStorage.removeItem('token'); setToken(null); }} className="logout-btn">
                    Cerrar Sesión
                </button>
            </header>

            <div className="dashboard-content">
                {/* Formulario de Creación / Edición */}
                <div className="exercise-form-card">
                    <h3>{editingId ? 'Editar Ejercicio' : 'Registrar Nuevo Ejercicio'}</h3>
                    <form onSubmit={handleSubmit}>
                        <input type="text" name="week" placeholder="Semana (ej: Semana 1)" value={form.week} onChange={handleChange} required />

                        <select name="day" value={form.day} onChange={handleChange} className="form-select" required>
                            {daysOfWeek.map((d) => (
                                <option key={d} value={d}>{d}</option>
                            ))}
                        </select>

                        <input type="text" name="name" placeholder="Nombre del Ejercicio" value={form.name} onChange={handleChange} required />
                        <input type="text" name="muscleGroup" placeholder="Grupo Muscular" value={form.muscleGroup} onChange={handleChange} required />
                        <input type="text" name="repetitions" placeholder="Repeticiones (ej: 12)" value={form.repetitions} onChange={handleChange} required />
                        <input type="text" name="sets" placeholder="Series (ej: 4)" value={form.sets} onChange={handleChange} required />
                        <input type="text" name="restBetweenReps" placeholder="Descanso x Rep (ej: 30s)" value={form.restBetweenReps} onChange={handleChange} required />
                        <input type="text" name="restBetweenSets" placeholder="Descanso x Series (ej: 2m)" value={form.restBetweenSets} onChange={handleChange} required />

                        <button type="submit" className="save-btn">
                            {editingId ? 'Actualizar Ejercicio' : 'Guardar Ejercicio'}
                        </button>
                        {editingId && (
                            <button type="button" className="cancel-btn" onClick={() => { setEditingId(null); setForm({ name: '', muscleGroup: '', repetitions: '', sets: '', restBetweenReps: '', restBetweenSets: '', week: 'Semana 1', day: 'Lunes' }); }}>
                                Cancelar
                            </button>
                        )}
                    </form>
                </div>

                {/* Visualización de Rutinas Creadas con Botón de Entrenar */}
                <div className="exercise-list-card">
                    <h3>Gestión de Rutinas</h3>
                    {loading && <p>Cargando rutinas...</p>}
                    {error && <p className="error-text">{error}</p>}

                    {!loading && exercises.length === 0 && (
                        <p>No hay ejercicios creados todavía. Utiliza el formulario de la izquierda.</p>
                    )}

                    {Object.keys(groupedByWeekAndDay).map((weekName) => (
                        <div key={weekName} className="week-section">
                            <h3 className="week-title">📅 {weekName}</h3>

                            {Object.keys(groupedByWeekAndDay[weekName]).map((dayName) => {
                                const dayExercises = groupedByWeekAndDay[weekName][dayName];

                                return (
                                    <div key={dayName} className="day-section">
                                        <div className="day-header-row">
                                            <h4 className="day-title">📌 {dayName}</h4>
                                            <button
                                                onClick={() => setActiveWorkout({ weekName, dayName, exercises: dayExercises })}
                                                className="complete-workout-btn"
                                            >
                                                🚀 Ir a Entrenar este Día
                                            </button>
                                        </div>

                                        <div className="table-responsive">
                                            <table className="excel-table">
                                                <thead>
                                                <tr>
                                                    <th>Nombre del Ejercicio</th>
                                                    <th>Grupo Muscular</th>
                                                    <th>Repeticiones</th>
                                                    <th>Series</th>
                                                    <th>Descanso x Rep</th>
                                                    <th>Descanso x Series</th>
                                                    <th>Acciones</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {dayExercises.map((ex) => (
                                                    <tr key={ex.id}>
                                                        <td><strong>{ex.name}</strong></td>
                                                        <td><span className="badge">{ex.muscleGroup}</span></td>
                                                        <td>{ex.repetitions}</td>
                                                        <td>{ex.sets}</td>
                                                        <td>{ex.restBetweenReps}</td>
                                                        <td>{ex.restBetweenSets}</td>
                                                        <td>
                                                            <div className="action-buttons">
                                                                <button onClick={() => handleEdit(ex)} className="edit-btn">Editar</button>
                                                                <button onClick={() => handleDelete(ex.id)} className="delete-btn">Eliminar</button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}