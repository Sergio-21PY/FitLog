import React, { useState, useEffect } from 'react';
import { getExercises } from '../services/exerciseService';
import WorkoutSession from './WorkoutSession';
import ProgressView from './ProgressView';
import AdminDashboard from './AdminDashboard';
import Navbar from './Navbar';
import './Dashboard.css';

export default function MainDashboard({ setToken }) {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Estados de navegación interna
    const [activeWorkout, setActiveWorkout] = useState(null); // { weekName, dayName, exercises }
    const [currentView, setCurrentView] = useState('main'); // 'main', 'progress', 'admin'
    const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);

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

    // Calcular el rango de fechas dinámico de la semana
    const getWeekRangeString = (offset) => {
        const now = new Date();
        const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1 + (offset * 7)));
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);

        const options = { day: 'numeric', month: 'short' };
        return `Semana del ${firstDayOfWeek.toLocaleDateString('es-ES', options)} al ${lastDayOfWeek.toLocaleDateString('es-ES', options)}`;
    };

    // 1. Si el usuario inició una sesión activa de entrenamiento
    if (activeWorkout) {
        return (
            <WorkoutSession
                weekName={getWeekRangeString(selectedWeekOffset)}
                dayName={activeWorkout.dayName}
                exercises={activeWorkout.exercises}
                onBack={() => setActiveWorkout(null)}
            />
        );
    }

    // 2. Si navega al panel de administrador
    if (currentView === 'admin') {
        return <AdminDashboard setToken={setToken} onBack={() => setCurrentView('main')} />;
    }

    // Agrupar ejercicios por Día de la semana
    const groupedByDay = exercises.reduce((acc, ex) => {
        const dayKey = ex.day || 'Lunes';
        if (!acc[dayKey]) acc[dayKey] = [];
        acc[dayKey].push(ex);
        return acc;
    }, {});

    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    return (
        <div className="dashboard-container">
            {/* Navbar superior constante */}
            <Navbar currentView={currentView} setCurrentView={setCurrentView} setToken={setToken} />

            {/* Renderizado condicional según la pestaña seleccionada en el Navbar */}
            {currentView === 'progress' ? (
                <ProgressView onBack={() => setCurrentView('main')} hideHeader={true} />
            ) : (
                <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>

                    {/* Selector de Semana por Fechas */}
                    <div className="exercise-list-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <button onClick={() => setSelectedWeekOffset(prev => prev - 1)} className="edit-btn" style={{ padding: '8px 16px' }}>
                            ← Semana Anterior
                        </button>
                        <h3 style={{ color: '#d8b4fe', margin: 0 }}>📅 {getWeekRangeString(selectedWeekOffset)}</h3>
                        <button onClick={() => setSelectedWeekOffset(prev => prev + 1)} className="edit-btn" style={{ padding: '8px 16px' }}>
                            Semana Siguiente →
                        </button>
                    </div>

                    <div className="exercise-list-card" style={{ width: '100%' }}>
                        <h3>Rutina Base Semanal</h3>
                        <p style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '20px' }}>Selecciona el día que te toca entrenar para registrar tus series, pesos y ganar puntos de honor.</p>

                        {loading && <p>Cargando rutina...</p>}
                        {error && <p className="error-text">{error}</p>}

                        {!loading && exercises.length === 0 && (
                            <p style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>No hay ejercicios configurados en la rutina todavía.</p>
                        )}

                        {daysOfWeek.map((dayName) => {
                            const dayExercises = groupedByDay[dayName] || [];
                            if (dayExercises.length === 0) return null;

                            return (
                                <div key={dayName} className="day-section" style={{ marginBottom: '30px' }}>
                                    <div className="day-header-row">
                                        <h4 className="day-title">📌 {dayName}</h4>
                                        <button
                                            onClick={() => setActiveWorkout({ weekName: getWeekRangeString(selectedWeekOffset), dayName, exercises: dayExercises })}
                                            className="complete-workout-btn"
                                        >
                                            🚀 Iniciar Rutina de {dayName}
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
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}