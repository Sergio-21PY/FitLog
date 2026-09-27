import React, { useState } from 'react';
import { registerUser, loginUser } from '../services/authService';
import './Auth.css';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ userName: '', email: '', password: '' });
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Nuevo para fiabilidad/experiencia de usuario

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);
        setIsLoading(true);

        try {
            if (isLogin) {
                const data = await loginUser({ email: formData.email, password: formData.password });
                setMessage(`¡Bienvenido de nuevo, ${data.user.userName || data.user.email}!`);
                localStorage.setItem('token', data.token); // Guardado seguro del token
            } else {
                await registerUser(formData);
                setMessage('¡Registro exitoso! Ahora puedes iniciar sesión.');
                setIsLogin(true);
                setFormData({ userName: '', email: '', password: '' });
            }
        } catch (err) {
            setIsError(true);
            setMessage(err.message || 'Error de conexión con el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>{isLogin ? 'Iniciar Sesión' : 'Registro'}</h2>
                <p className="auth-subtitle">FitLog - Gestiona tus entrenamientos</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    {!isLogin && (
                        <div className="input-group">
                            <input
                                type="text"
                                name="userName"
                                placeholder="Nombre de usuario"
                                value={formData.userName}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}
                    <div className="input-group">
                        <input
                            type="email"
                            name="email"
                            placeholder="Correo electrónico"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            name="password"
                            placeholder="Contraseña"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-button" disabled={isLoading}>
                        {isLoading ? 'Procesando...' : (isLogin ? 'Entrar' : 'Registrarse')}
                    </button>
                </form>

                <p className="auth-switch">
                    {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                    <span onClick={() => { setIsLogin(!isLogin); setMessage(''); }}>
                        {isLogin ? ' Regístrate' : ' Inicia sesión'}
                    </span>
                </p>

                {message && (
                    <p className={`auth-message ${isError ? 'error' : 'success'}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}