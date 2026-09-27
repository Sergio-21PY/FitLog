import React, { useState, useEffect } from 'react';
import './Dashboard.css';

export default function ProgressView({ onBack, hideHeader = false }) {
    const [userXP, setUserXP] = useState(0);
    const [userLevel, setUserLevel] = useState(1);
    const [userHonor, setUserHonor] = useState(0);
    const [completedWorkouts, setCompletedWorkouts] = useState([]);
    const [exerciseHistory, setExerciseHistory] = useState([]);

    const [selectedAvatar, setSelectedAvatar] = useState(() => localStorage.getItem('fitlog_avatar') || '🦾');
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);

    const avatars = ['🦾', '⚡', '🛡️', '💀', '👑', '🔥', '🥊', '🚀'];

    useEffect(() => {
        const loadProgressData = () => {
            setUserXP(parseInt(localStorage.getItem('fitlog_xp')) || 0);
            setUserLevel(parseInt(localStorage.getItem('fitlog_level')) || 1);
            setUserHonor(parseInt(localStorage.getItem('fitlog_honor')) || 0);
            try {
                setCompletedWorkouts(JSON.parse(localStorage.getItem('fitlog_completed')) || []);
                setExerciseHistory(JSON.parse(localStorage.getItem('fitlog_exercise_history')) || []);
            } catch {
                setCompletedWorkouts([]);
                setExerciseHistory([]);
            }
        };

        loadProgressData();
        window.addEventListener('focus', loadProgressData);
        return () => window.removeEventListener('focus', loadProgressData);
    }, []);

    const handleSelectAvatar = (avatar) => {
        setSelectedAvatar(avatar);
        localStorage.setItem('fitlog_avatar', avatar);
        setShowAvatarSelector(false);
    };

    const currentLevel = Math.min(Math.max(userLevel, 1), 200);
    const xpMax = currentLevel * 400;
    const progressPercentage = Math.min(Math.round((userXP / xpMax) * 100), 100);

    const totalCompletedCount = completedWorkouts.length;
    const weeklyGoal = 4;
    const goalPercentage = Math.min(Math.round((totalCompletedCount / weeklyGoal) * 100), 100);

    // --- DETALLES ORNAMENTALES Y MARCOS EXTERNOS HASTA NIVEL 200 ---
    const getLevelFrameInfo = (level) => {
        if (level === 200) return { name: '✨ Deidad del Olimpo (Nivel 200)', color: '#ffffff', shadow: '0 0 50px rgba(255, 255, 255, 0.95), 0 0 100px rgba(253, 224, 71, 0.7)', borderStyle: 'double 7px', badge: '👑 DIOS DEL OLIMPO', badgeBg: 'linear-gradient(135deg, #fde047, #f59e0b)' };
        if (level >= 150) return { name: 'Marco Cósmico Ancestral (150+)', color: '#fde047', shadow: '0 0 35px rgba(253, 224, 71, 0.9)', borderStyle: 'double 6px', badge: '⚡ CÓSMICO', badgeBg: 'linear-gradient(135deg, #fde047, #ca8a04)' };
        if (level >= 100) return { name: 'Marco de Magma Definitivo (100+)', color: '#ef4444', shadow: '0 0 28px rgba(239, 68, 68, 0.85)', borderStyle: 'solid 5px', badge: '🔥 MAGMA', badgeBg: 'linear-gradient(135deg, #ef4444, #991b1b)' };
        if (level >= 75) return { name: 'Marco Diamante Estelar (75+)', color: '#38bdf8', shadow: '0 0 24px rgba(56, 189, 248, 0.8)', borderStyle: 'solid 5px', badge: '💎 DIAMANTE', badgeBg: 'linear-gradient(135deg, #38bdf8, #0284c7)' };
        if (level >= 50) return { name: 'Marco Amatista Real (50+)', color: '#c084fc', shadow: '0 0 20px rgba(192, 132, 252, 0.75)', borderStyle: 'solid 4px', badge: '🔮 AMATISTA', badgeBg: 'linear-gradient(135deg, #c084fc, #7e22ce)' };
        if (level >= 25) return { name: 'Marco de Platino (25+)', color: '#34d399', shadow: '0 0 16px rgba(52, 211, 153, 0.65)', borderStyle: 'solid 4px', badge: '🛡️ PLATINO', badgeBg: 'linear-gradient(135deg, #34d399, #059669)' };
        if (level >= 10) return { name: 'Marco de Acero Dorado (10+)', color: '#fbbf24', shadow: '0 0 14px rgba(251, 191, 36, 0.6)', borderStyle: 'solid 3px', badge: '⭐ DORADO', badgeBg: 'linear-gradient(135deg, #fbbf24, #d97706)' };
        return { name: 'Marco de Bronce Novato (1+)', color: '#b45309', shadow: '0 0 10px rgba(180, 83, 9, 0.5)', borderStyle: 'solid 3px', badge: '🥉 NOVATO', badgeBg: 'linear-gradient(135deg, #b45309, #78350f)' };
    };

    const currentFrame = getLevelFrameInfo(currentLevel);

    const getLeagueInfo = (honor) => {
        if (honor >= 1000) return { name: 'Leyenda', color: '#fde047', next: 1000, desc: 'Rango Máximo Absoluto' };
        if (honor >= 700) return { name: 'Diamante', color: '#38bdf8', next: 1000, desc: 'Atleta de Élite' };
        if (honor >= 450) return { name: 'Platino', color: '#c084fc', next: 700, desc: 'Disciplina de Acero' };
        if (honor >= 250) return { name: 'Oro', color: '#fbbf24', next: 450, desc: 'Constancia Destacada' };
        if (honor >= 100) return { name: 'Plata', color: '#94a3b8', next: 250, desc: 'En Ascenso' };
        return { name: 'Bronce', color: '#b45309', next: 100, desc: 'Iniciando el Camino' };
    };

    const currentLeague = getLeagueInfo(userHonor);
    const honorToNext = Math.max(currentLeague.next - userHonor, 0);
    const leagueProgress = currentLeague.name === 'Leyenda' ? 100 : Math.min(Math.round((userHonor / currentLeague.next) * 100), 100);

    const totalSetsCompleted = exerciseHistory.length;
    const estimatedCalories = totalSetsCompleted * 45;
    const totalVolumeLifted = exerciseHistory.reduce((acc, curr) => {
        const weight = parseFloat(curr.weight) || 0;
        return acc + (weight * 10);
    }, 0);

    return (
        <div className="dashboard-container" style={{ width: '100%' }}>
            {!hideHeader && (
                <header className="dashboard-header">
                    <h2>FitLog - Progreso, Ligas y Estadísticas</h2>
                    <button onClick={onBack} className="logout-btn" style={{ backgroundColor: '#6366f1' }}>
                        ← Volver
                    </button>
                </header>
            )}

            <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', gap: '30px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

                {/* --- PERFIL DE ATLETA --- */}
                <div className="exercise-list-card" style={{ background: 'linear-gradient(135deg, rgba(18,18,26,0.95), rgba(30,20,50,0.95))', border: `1px solid ${currentFrame.color}55`, textAlign: 'center', padding: '30px 20px' }}>

                    <span style={{ color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '5px' }}>
                        PERFIL DE ATLETA • {currentFrame.name}
                    </span>
                    <h2 style={{ fontSize: '32px', color: currentFrame.color, margin: '0 0 5px 0', textShadow: `0 0 12px ${currentFrame.color}55` }}>
                        Nivel {currentLevel} / 200
                    </h2>
                    <p style={{ color: '#cbd5e1', fontSize: '14px', margin: '0 0 20px 0' }}>Escala hasta el nivel 200 para desbloquear el marco definitivo del Olimpo.</p>

                    {/* Insignia de Rango Ordenada (Fuera del Avatar, sin solaparse) */}
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
                        <div style={{
                            background: currentFrame.badgeBg,
                            color: currentLevel === 200 ? '#0f0f14' : '#fff',
                            fontSize: '12px',
                            fontWeight: '800',
                            padding: '6px 18px',
                            borderRadius: '20px',
                            boxShadow: `0 4px 15px ${currentFrame.color}66`,
                            letterSpacing: '0.5px',
                            border: '1px solid rgba(255,255,255,0.4)',
                            display: 'inline-block'
                        }}>
                            {currentFrame.badge}
                        </div>
                    </div>

                    {/* Contenedor Avatar Central con su Marco */}
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '15px 0' }}>
                        <div
                            onClick={() => setShowAvatarSelector(!showAvatarSelector)}
                            title="Haz clic para cambiar tu icono"
                            style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                border: currentFrame.borderStyle,
                                borderColor: currentFrame.color,
                                boxShadow: currentFrame.shadow,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '45px',
                                background: 'rgba(15, 15, 20, 0.95)',
                                cursor: 'pointer',
                                position: 'relative',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            {selectedAvatar}
                            <span style={{
                                position: 'absolute',
                                bottom: '-8px',
                                background: currentFrame.color,
                                color: '#0f0f14',
                                fontSize: '10px',
                                fontWeight: 'bold',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                textTransform: 'uppercase'
                            }}>
                                Editar
                            </span>
                        </div>
                    </div>

                    {showAvatarSelector && (
                        <div style={{ margin: '25px auto', maxWidth: '400px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', color: '#94a3b8', width: '100%', marginBottom: '5px' }}>Elige tu icono de atleta:</span>
                            {avatars.map((av, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelectAvatar(av)}
                                    style={{
                                        background: selectedAvatar === av ? 'rgba(168, 85, 247, 0.3)' : 'rgba(255,255,255,0.05)',
                                        border: selectedAvatar === av ? '1px solid #a855f7' : '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px',
                                        fontSize: '22px',
                                        padding: '8px 12px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {av}
                                </button>
                            ))}
                        </div>
                    )}

                    <div style={{ marginTop: '25px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#d8b4fe', marginBottom: '6px', fontWeight: 'bold' }}>
                            <span>Progreso de Nivel {currentLevel} ➔ Nivel {Math.min(currentLevel + 1, 200)}</span>
                            <span>{userXP} / {xpMax} XP ({progressPercentage}%)</span>
                        </div>
                        <div className="xp-progress-bar-container">
                            <div className="xp-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                    </div>
                </div>

                {/* --- LIGA COMPETITIVA --- */}
                <div className="exercise-list-card" style={{ background: 'linear-gradient(135deg, rgba(18,18,26,0.9), rgba(30,20,50,0.9))', border: `1px solid ${currentLeague.color}55` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                        <div>
                            <span style={{ color: '#94a3b8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>Liga Competitiva</span>
                            <h2 style={{ fontSize: '28px', color: currentLeague.color, margin: '5px 0' }}>{currentLeague.name}</h2>
                            <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0 }}>{currentLeague.desc}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#d8b4fe' }}>{userHonor} pts</span>
                            <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>{currentLeague.name === 'Leyenda' ? '¡Honor Máximo!' : `Faltan ${honorToNext} pts para la siguiente liga`}</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '20px' }}>
                        <div className="xp-progress-bar-container">
                            <div className="xp-progress-fill" style={{ width: `${leagueProgress}%`, background: `linear-gradient(90deg, #6366f1, ${currentLeague.color})` }}></div>
                        </div>
                    </div>
                </div>

                {/* Métricas Generales */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                    <div className="exercise-list-card" style={{ textAlign: 'center' }}>
                        <h4>📅 Rutinas Terminadas</h4>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#34d399', margin: '12px 0' }}>{totalCompletedCount}</p>
                        <p style={{ color: '#94a3b8', fontSize: '13px' }}>Sesiones exitosas</p>
                    </div>

                    <div className="exercise-list-card" style={{ textAlign: 'center' }}>
                        <h4>🔥 Calorías Estimadas</h4>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#fb923c', margin: '12px 0' }}>{estimatedCalories} kcal</p>
                        <p style={{ color: '#94a3b8', fontSize: '13px' }}>Basado en volumen</p>
                    </div>

                    <div className="exercise-list-card" style={{ textAlign: 'center' }}>
                        <h4>🏋️‍♂️ Volumen Total Movido</h4>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#818cf8', margin: '12px 0' }}>{totalVolumeLifted.toLocaleString()} kg</p>
                        <p style={{ color: '#94a3b8', fontSize: '13px' }}>Peso acumulado</p>
                    </div>

                    <div className="exercise-list-card" style={{ textAlign: 'center' }}>
                        <h4>🎯 Cumplimiento</h4>
                        <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#a855f7', margin: '12px 0' }}>{goalPercentage}%</p>
                        <p style={{ color: '#94a3b8', fontSize: '13px' }}>Objetivo semanal</p>
                    </div>
                </div>

            </div>
        </div>
    );
}