import React, { useState, useEffect } from 'react';
import WorkoutSession from './WorkoutSession';
import ProgressView from './ProgressView';
import AdminDashboard from './AdminDashboard'; // <--- ASEGÚRATE DE IMPORTARLO AQUÍ
import './Dashboard.css';

export default function MainDashboard({ setToken }) {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [activeWorkout, setActiveWorkout] = useState(null);
    const [currentView, setCurrentView] = useState('main'); // 'main', 'progress', 'admin'
    const [selectedWeekOffset, setSelectedWeekOffset] = useState(0);

    useEffect(() => {
        let isMounted = true;
        try {
            const cachedExercises = JSON.parse(localStorage.getItem('fitlog_exercises_cache'));
            if (cachedExercises && cachedExercises.length > 0 && isMounted) {
                setExercises(cachedExercises);
                setLoading(false);
            }
        } catch (e) {
            console.error("Error caché local", e);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        fetch('http://localhost:8080/api/exercises', { signal: controller.signal })
            .then(response => {
                clearTimeout(timeoutId);
                if (!response.ok) throw new Error('Error al conectar con el servidor backend');
                return response.json();
            })
            .then(data => {
                if (isMounted && Array.isArray(data)) {
                    setExercises(data);
                    localStorage.setItem('fitlog_exercises_cache', JSON.stringify(data));
                    setLoading(false);
                }
            })
            .catch(err => {
                clearTimeout(timeoutId);
                if (isMounted) {
                    if (exercises.length === 0) {
                        setError('No se pudo conectar con el servidor. Verifica que tu backend esté encendido.');
                    }
                    setLoading(false);
                }
            });

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, []);

    const getWeekRangeString = (offset) => {
        const now = new Date();
        const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 1 + (offset * 7)));
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);

        const options = { day: 'numeric', month: 'short' };
        return `Semana del ${firstDayOfWeek.toLocaleDateString('es-ES', options)} al ${lastDayOfWeek.toLocaleDateString('es-ES', options)}`;
    };

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

    const groupedByDay = exercises.reduce((acc, ex) => {
        const dayKey = ex.day || 'Lunes';
        if (!acc[dayKey]) acc[dayKey] = [];
        acc[dayKey].push(ex);
        return acc;
    }, {});

    const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    return (
        <div style={{ minHeight: '100vh', background: '#09090b', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: '50px' }}>

            {/* --- NAVBAR MODERNO --- */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 40px', background: 'rgba(18, 18, 26, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                    <h2 style={{ margin: 0, cursor: 'pointer', color: '#d8b4fe', fontSize: '22px', fontWeight: '800' }} onClick={() => setCurrentView('main')}>
                        FitLog <span style={{ color: '#a855f7' }}>⚡</span>
                    </h2>
                    <nav style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <button
                            onClick={() => setCurrentView('main')}
                            style={{ background: currentView === 'main' ? 'linear-gradient(135deg, #7c3aed, #6366f1)' : 'transparent', border: 'none', color: currentView === 'main' ? '#fff' : '#94a3b8', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                        >
                            📋 Plan Semanal
                        </button>
                        <button
                            onClick={() => setCurrentView('progress')}
                            style={{ background: currentView === 'progress' ? 'linear-gradient(135deg, #7c3aed, #6366f1)' : 'transparent', border: 'none', color: currentView === 'progress' ? '#fff' : '#94a3b8', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                        >
                            📊 Progreso y Ligas
                        </button>
                        <button
                            onClick={() => setCurrentView('admin')}
                            style={{ background: currentView === 'admin' ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'transparent', border: 'none', color: currentView === 'admin' ? '#fff' : '#94a3b8', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                        >
                            🛡️ Admin
                        </button>
                    </nav>
                </div>

                <button onClick={() => { localStorage.removeItem('token'); setToken(null); }} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                    Cerrar Sesión
                </button>
            </header>

            {/* --- CONTENIDO SEGÚN LA VISTA SELECCIONADA --- */}
            <main style={{ maxWidth: '1100px', margin: '40px auto 0 auto', padding: '0 20px' }}>

                {currentView === 'progress' && (
                    <ProgressView onBack={() => setCurrentView('main')} hideHeader={true} />
                )}

                {/* --- RENDERIZADO DEL PANEL DE ADMINISTRADOR REAL --- */}
                {currentView === 'admin' && (
                    <AdminDashboard setToken={setToken} onBack={() => setCurrentView('main')} />
                )}

                {currentView === 'main' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '16px 24px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <button onClick={() => setSelectedWeekOffset(prev => prev - 1)} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                                ← Semana Anterior
                            </button>
                            <h3 style={{ color: '#d8b4fe', margin: 0, fontSize: '16px', fontWeight: '700' }}>📅 {getWeekRangeString(selectedWeekOffset)}</h3>
                            <button onClick={() => setSelectedWeekOffset(prev => prev + 1)} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.05)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
                                Semana Siguiente →
                            </button>
                        </div>

                        <div style={{ background: 'rgba(18, 18, 26, 0.7)', backdropFilter: 'blur(10px)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ marginBottom: '25px' }}>
                                <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#f8fafc' }}>Planificación de Entrenamiento</h2>
                                <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>Selecciona el día que te toca entrenar para iniciar tu sesión y registrar tus marcas.</p>
                            </div>

                            {loading && <p style={{ color: 'white', textAlign: 'center', padding: '40px' }}>Cargando rutina...</p>}
                            {error && <p style={{ color: '#f87171', background: 'rgba(239,68,68,0.1)', padding: '15px', borderRadius: '8px' }}>⚠️ {error}</p>}

                            {!loading && exercises.length === 0 && !error && (
                                <p style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No hay ejercicios configurados en la rutina todavía.</p>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {daysOfWeek.map((dayName) => {
                                    const dayExercises = groupedByDay[dayName] || [];
                                    if (dayExercises.length === 0) return null;

                                    return (
                                        <div key={dayName} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(168, 85, 247, 0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <h4 style={{ color: '#d8b4fe', margin: 0, fontSize: '16px', fontWeight: '700' }}>📌 {dayName}</h4>
                                                <button
                                                    onClick={() => setActiveWorkout({ weekName: getWeekRangeString(selectedWeekOffset), dayName, exercises: dayExercises })}
                                                    style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white', border: 'none', padding: '8px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)' }}
                                                >
                                                    🚀 Iniciar Rutina
                                                </button>
                                            </div>

                                            <div style={{ overflowX: 'auto', padding: '10px 20px' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                                    <thead>
                                                    <tr style={{ color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <th style={{ padding: '10px 0' }}>Ejercicio</th>
                                                        <th style={{ padding: '10px 0' }}>Grupo Muscular</th>
                                                        <th style={{ padding: '10px 0' }}>Reps</th>
                                                        <th style={{ padding: '10px 0' }}>Series</th>
                                                        <th style={{ padding: '10px 0' }}>Descanso (Rep)</th>
                                                        <th style={{ padding: '10px 0' }}>Descanso (Serie)</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {dayExercises.map((ex) => (
                                                        <tr key={ex.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                            <td style={{ padding: '12px 0', color: '#f8fafc', fontWeight: '600' }}>{ex.name}</td>
                                                            <td style={{ padding: '12px 0' }}>
                                                                    <span style={{ background: 'rgba(168,85,247,0.15)', padding: '4px 10px', borderRadius: '6px', color: '#e9d5ff', fontSize: '12px', fontWeight: '500' }}>
                                                                        {ex.muscleGroup}
                                                                    </span>
                                                            </td>
                                                            <td style={{ padding: '12px 0', color: '#94a3b8' }}>{ex.repetitions}</td>
                                                            <td style={{ padding: '12px 0', color: '#94a3b8' }}>{ex.sets}</td>
                                                            <td style={{ padding: '12px 0', color: '#94a3b8' }}>{ex.restBetweenReps}</td>
                                                            <td style={{ padding: '12px 0', color: '#94a3b8' }}>{ex.restBetweenSets}</td>
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

                    </div>
                )}
            </main>
        </div>
    );
}