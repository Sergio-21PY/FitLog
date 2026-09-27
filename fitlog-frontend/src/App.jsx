import React, { useState } from 'react';
import Auth from './components/Auth';
import MainDashboard from './components/MainDashboard';
import './App.css';

export default function App() {
    const [token, setToken] = useState(localStorage.getItem('token'));

    if (!token) {
        return <Auth setToken={setToken} />;
    }

    return <MainDashboard setToken={setToken} />;
}