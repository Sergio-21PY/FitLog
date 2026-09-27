import React, { useState, useEffect } from 'react';
import './Dashboard.css';

export default function WorkoutSession({ weekName, dayName, exercises, onBack }) {
    const [userXP, setUserXP] = useState(() => parseInt(localStorage.getItem('fitlog_xp')) || 0);
    const [userLevel, setUserLevel] = useState(() => parseInt(localStorage.getItem('fitlog_level')) || 1);

    // --- CAMBIO DE MEDALLAS A PUNTOS DE HONOR ---
    const [userHonor, setUserHonor] = useState(() => parseInt(localStorage.getItem('fitlog_honor')) || 0);

    const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
    const [currentSet, setCurrentSet] = useState(1);
    const [weightLifted, setWeightLifted] = useState('');
    const [isFinished, setIsFinished] = useState(false);

    const [isResting, setIsResting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [isBreaking, setIsBreaking] = useState(false);

    const saveProgress = (newXP, newLevel, newHonor) => {
        localStorage.setItem('fitlog_xp', newXP);
        localStorage.setItem('fitlog_level', newLevel);
        localStorage.setItem('fitlog_honor', newHonor);
    };

    const parseRestTime = (restStr) => {
        if (!restStr) return 30;
        const lower = restStr.toLowerCase();
        let totalSeconds = 30;
        if (lower.includes('m')) {
            const minutes = parseFloat(lower.replace('m', '').trim()) || 1;
            totalSeconds = minutes * 60;
        } else {
            totalSeconds = parseInt(lower.replace('s', '').trim()) || 30;
        }
        return totalSeconds;
    };

    useEffect(() => {
        let timer = null;
        if (isResting && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (isResting && timeLeft === 0) {
            setIsResting(false);
        }
        return () => clearInterval(timer);
    }, [isResting, timeLeft]);

    const handleCompleteSet = () => {
        const currentEx = exercises[activeExerciseIndex];
        const totalSets = parseInt(currentEx.sets) || 3;

        // Guardar historial de peso
        const currentHistory = JSON.parse(localStorage.getItem('fitlog_exercise_history')) || [];
        currentHistory.push({
            exerciseName: currentEx.name,
            setNumber: currentSet,
            weight: parseFloat(weightLifted) || 0,
            date: new Date().toLocaleDateString()
        });
        localStorage.setItem('fitlog_exercise_history', JSON.stringify(currentHistory));
        setWeightLifted('');

        // Otorgar XP y Honor por cada serie completada
        const xpEarned = 10;
        const honorEarned = 5; // +5 Puntos de Honor por serie

        let newXP = userXP + xpEarned;
        let newLevel = userLevel;
        let newHonor = userHonor + honorEarned;

        const xpNeeded = newLevel * 300;
        if (newXP >= xpNeeded) {
            newXP -= xpNeeded;
            newLevel += 1;
            alert(`¡Felicidades! Has subido al Nivel ${newLevel} 🚀`);
        }

        setUserXP(newXP);
        setUserLevel(newLevel);
        setUserHonor(newHonor);
        saveProgress(newXP, newLevel, newHonor);

        // Guardar rutina completada si es el final de la sesión
        if (currentSet === totalSets && activeExerciseIndex + 1 === exercises.length) {
            const completed = JSON.parse(localStorage.getItem('fitlog_completed')) || [];
            completed.push({ day: dayName, week: weekName, date: new Date().toLocaleDateString() });
            localStorage.setItem('fitlog_completed', JSON.stringify(completed));
        }

        if (currentSet < totalSets) {
            const restSeconds = parseRestTime(currentEx.restBetweenReps);
            setTimeLeft(restSeconds);
            setIsResting(true);
            setCurrentSet((prev) => prev + 1);
        } else {
            setIsBreaking(true);
            const restBetweenExercises = parseRestTime(currentEx.restBetweenSets);

            setTimeout(() => {
                setIsBreaking(false);
                if (activeExerciseIndex + 1 < exercises.length) {
                    setActiveExerciseIndex((prev) => prev + 1);
                    setCurrentSet(1);
                    setTimeLeft(restBetweenExercises);
                    setIsResting(true);
                } else {
                    setIsFinished(true);
                }
            }, 600);
        }
    };

    const xpMax = userLevel * 300;
    const progressPercentage = Math.min(Math.round((userXP / xpMax) * 100), 100);
    const currentEx = exercises[activeExerciseIndex];
    const totalSets = currentEx ? parseInt(currentEx.sets) || 3 : 3;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>FitLog - Módulo de Entrenamiento ({dayName} - {weekName})</h2>
                <button onClick={onBack} className="logout-btn" style={{ backgroundColor: '#6366f1' }}>
                    ← Volver al Menú
                </button>
            </header>

            {/* Banner de Gamificación con Honor */}
            <div className="gamification-banner">
                <div className="level-info">
                    <h3>Nivel {userLevel} ⚡</h3>
                    <p>{userXP} / {xpMax} XP | ⭐ Honor: {userHonor} pts</p>
                </div>
                <div className="xp-progress-bar-container">
                    <div className="xp-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
                </div>
            </div>

            <div className="workout-session-content">
                {!isFinished ? (
                    <div className={`workout-active-card ${isBreaking ? 'break-animation' : ''}`}>
                        <h3>Ejercicio {activeExerciseIndex + 1} de {exercises.length}</h3>

                        {isResting ? (
                            <div className="rest-timer-container">
                                <h4>⏱️ Tiempo de Descanso</h4>
                                <div className="timer-display">{timeLeft}s</div>
                                <p>Recupera el aliento para la siguiente fase...</p>
                                <button onClick={() => setIsResting(false)} className="save-btn" style={{ marginTop: '15px' }}>
                                    Saltar Descanso ⏭️
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="active-exercise-box">
                                    <h4>{currentEx.name}</h4>
                                    <p><strong>Grupo Muscular:</strong> {currentEx.muscleGroup}</p>
                                    <p><strong>Progreso de Serie:</strong> <span style={{ color: '#a855f7', fontWeight: 'bold' }}>Serie {currentSet} de {totalSets}</span></p>
                                    <p><strong>Repeticiones objetivo:</strong> {currentEx.repetitions}</p>
                                    <p><strong>Descanso x Rep:</strong> {currentEx.restBetweenReps} | <strong>Descanso x Series:</strong> {currentEx.restBetweenSets}</p>

                                    <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                        <label style={{ fontSize: '13px', color: '#cbd5e1' }}>Peso utilizado en esta serie (kg):</label>
                                        <input
                                            type="number"
                                            placeholder="Ej: 60"
                                            value={weightLifted}
                                            onChange={(e) => setWeightLifted(e.target.value)}
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '8px',
                                                padding: '10px',
                                                color: 'white',
                                                fontSize: '14px',
                                                outline: 'none'
                                            }}
                                        />
                                    </div>
                                </div>
                                <button onClick={handleCompleteSet} className="save-btn" style={{ marginTop: '20px' }}>
                                    ✓ Finalizar Serie {currentSet} (+10 XP, +5 Honor)
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="workout-active-card" style={{ textAlign: 'center' }}>
                        <h2>🎉 ¡Rutina Completada con Éxito!</h2>
                        <p>Has ganado honor y avanzado en tu liga de entrenamiento.</p>
                        <button onClick={onBack} className="save-btn" style={{ marginTop: '20px' }}>
                            Volver al Menú Principal
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}