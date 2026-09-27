import React, { useState, useEffect } from 'react';
import './Dashboard.css';

export default function AdminDashboard({ setToken, onBack }) {
    const [users, setUsers] = useState([]);
    const [searchFilter, setSearchFilter] = useState('');
    const [editingUser, setEditingUser] = useState(null);
    const [notification, setNotification] = useState('');
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState('');

    useEffect(() => {
        loadUsersFromBackend();
    }, []);

    const loadUsersFromBackend = async () => {
        try {
            setLoading(true);
            setFetchError('');
            const response = await fetch('http://localhost:8080/api/users');
            if (response.ok) {
                const data = await response.json();

                // Valores locales actuales como respaldo para el primer usuario
                const currentLocalLevel = parseInt(localStorage.getItem('fitlog_level')) || 1;
                const currentLocalXP = parseInt(localStorage.getItem('fitlog_xp')) || 0;
                const currentLocalHonor = parseInt(localStorage.getItem('fitlog_honor')) || 0;

                const formattedUsers = data.map((u, index) => ({
                    id: u.id,
                    name: u.name || u.userName || u.user_name || 'Sin nombre',
                    email: u.email || 'Sin correo',
                    level: index === 0 ? currentLocalLevel : (u.level || 1),
                    xp: index === 0 ? currentLocalXP : (u.xp || 0),
                    honor: index === 0 ? currentLocalHonor : (u.honor || 0)
                }));
                setUsers(formattedUsers);
            } else {
                setFetchError('El servidor respondió con un error al listar usuarios.');
            }
        } catch (err) {
            console.error('Error de conexión:', err);
            // Respaldo local si el backend no está disponible temporalmente
            setUsers([
                {
                    id: 1,
                    name: localStorage.getItem('fitlog_username') || 'Sergio Soto',
                    email: 'sergio@fitlog.com',
                    level: parseInt(localStorage.getItem('fitlog_level')) || 1,
                    xp: parseInt(localStorage.getItem('fitlog_xp')) || 0,
                    honor: parseInt(localStorage.getItem('fitlog_honor')) || 0
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveUserEdit = (e) => {
        e.preventDefault();
        if (!editingUser) return;

        // Validar límite de nivel hasta 200
        const clampedLevel = Math.min(Math.max(parseInt(editingUser.level) || 1, 1), 200);
        const updatedUser = { ...editingUser, level: clampedLevel };

        // Sincronización automática con localStorage si es el usuario actual
        if (updatedUser.id === 1 || updatedUser.email.includes('sergio') || users.indexOf(editingUser) === 0) {
            localStorage.setItem('fitlog_level', updatedUser.level);
            localStorage.setItem('fitlog_xp', updatedUser.xp);
            localStorage.setItem('fitlog_honor', updatedUser.honor);
            localStorage.setItem('fitlog_username', updatedUser.name);
        }

        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        setNotification(`¡Atleta ${updatedUser.name} actualizado y sincronizado con éxito!`);
        setEditingUser(null);
        setTimeout(() => setNotification(''), 3500);
    };

    const filteredUsers = users.filter(user =>
        (user.name && user.name.toLowerCase().includes(searchFilter.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchFilter.toLowerCase()))
    );

    return (
        <div style={{ minHeight: '100vh', background: '#09090b', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif', paddingBottom: '50px' }}>

            {/* Header del Panel Admin */}
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 40px', background: 'rgba(18, 18, 26, 0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h2 style={{ margin: 0, color: '#f87171', fontSize: '20px', fontWeight: '800' }}>
                    🛡️ Panel de Control de Administrador
                </h2>
                <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.05)', color: '#f8fafc', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    ← Volver al Plan
                </button>
            </header>

            <main style={{ maxWidth: '1100px', margin: '40px auto 0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: '30px' }}>

                {notification && (
                    <div style={{ background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', color: '#34d399', padding: '12px 20px', borderRadius: '10px', textAlign: 'center', fontWeight: '600' }}>
                        {notification}
                    </div>
                )}

                {fetchError && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '12px 20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>⚠️ {fetchError}</span>
                        <button onClick={loadUsersFromBackend} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Reintentar</button>
                    </div>
                )}

                {/* Sección de Gestión de Usuarios y Filtros */}
                <div style={{ background: 'rgba(18, 18, 26, 0.7)', backdropFilter: 'blur(10px)', padding: '30px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                        <div>
                            <h3 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#f8fafc' }}>Gestión de Usuarios Registrados</h3>
                            <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>Busca atletas, edita nombres, niveles (hasta 200), XP y puntos de honor.</p>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {/* Filtro de Búsqueda */}
                            <input
                                type="text"
                                placeholder="🔍 Buscar por nombre o correo..."
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '8px', color: 'white', width: '260px', outline: 'none', fontSize: '14px' }}
                            />
                            <button onClick={loadUsersFromBackend} style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer' }} title="Actualizar lista">
                                🔄
                            </button>
                        </div>
                    </div>

                    {loading && <p style={{ color: '#94a3b8', textAlign: 'center', padding: '30px' }}>Cargando usuarios desde MySQL...</p>}

                    {/* Tabla de Usuarios */}
                    {!loading && (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                                <thead>
                                <tr style={{ color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <th style={{ padding: '12px 10px' }}>ID</th>
                                    <th style={{ padding: '12px 10px' }}>Nombre</th>
                                    <th style={{ padding: '12px 10px' }}>Correo</th>
                                    <th style={{ padding: '12px 10px' }}>Nivel</th>
                                    <th style={{ padding: '12px 10px' }}>XP</th>
                                    <th style={{ padding: '12px 10px' }}>Honor (Ligas)</th>
                                    <th style={{ padding: '12px 10px', textAlign: 'center' }}>Acciones</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                        <td style={{ padding: '14px 10px', color: '#64748b' }}>#{u.id}</td>
                                        <td style={{ padding: '14px 10px', color: '#f8fafc', fontWeight: '600' }}>{u.name}</td>
                                        <td style={{ padding: '14px 10px', color: '#94a3b8' }}>{u.email}</td>
                                        <td style={{ padding: '14px 10px' }}>
                                                <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '4px 10px', borderRadius: '6px', fontWeight: '600' }}>
                                                    Nivel {u.level}
                                                </span>
                                        </td>
                                        <td style={{ padding: '14px 10px', color: '#d8b4fe', fontWeight: '600' }}>{u.xp} XP</td>
                                        <td style={{ padding: '14px 10px', color: '#fbbf24', fontWeight: '600' }}>{u.honor} pts</td>
                                        <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => setEditingUser(u)}
                                                style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#d8b4fe', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s' }}
                                            >
                                                ✏️ Editar Rango / XP
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && !loading && (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                            No se encontraron usuarios registrados.
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal / Formulario flotante para Editar al Usuario */}
                {editingUser && (
                    <div style={{ background: 'rgba(18, 18, 26, 0.95)', border: '1px solid rgba(168, 85, 247, 0.4)', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                        <h3 style={{ margin: '0 0 15px 0', color: '#d8b4fe' }}>Editando Atleta: {editingUser.name}</h3>

                        <form onSubmit={handleSaveUserEdit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13px', color: '#94a3b8' }}>Nombre del Atleta:</label>
                                <input
                                    type="text"
                                    value={editingUser.name}
                                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', color: 'white', outline: 'none' }}
                                    required
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13px', color: '#94a3b8' }}>Nivel (1 al 200):</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="200"
                                    value={editingUser.level}
                                    onChange={(e) => setEditingUser({ ...editingUser, level: parseInt(e.target.value) || 1 })}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', color: 'white', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13px', color: '#94a3b8' }}>Puntos de Experiencia (XP):</label>
                                <input
                                    type="number"
                                    value={editingUser.xp}
                                    onChange={(e) => setEditingUser({ ...editingUser, xp: parseInt(e.target.value) || 0 })}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', color: 'white', outline: 'none' }}
                                />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <label style={{ fontSize: '13px', color: '#94a3b8' }}>Puntos de Honor (Ligas):</label>
                                <input
                                    type="number"
                                    value={editingUser.honor}
                                    onChange={(e) => setEditingUser({ ...editingUser, honor: parseInt(e.target.value) || 0 })}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', color: 'white', outline: 'none' }}
                                />
                            </div>

                            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '10px' }}>
                                <button type="button" onClick={() => setEditingUser(null)} style={{ background: 'transparent', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>
                                    Cancelar
                                </button>
                                <button type="submit" style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Guardar Cambios 💾
                                </button>
                            </div>
                        </form>
                    </div>
                )}

            </main>
        </div>
    );
}