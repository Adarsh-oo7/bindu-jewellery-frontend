import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Legacy checkAuth disabled to prevent conflict with Zustand store
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/accounts/login/', { email, password });
        const { access, refresh, user: userData } = response.data;
        
        localStorage.setItem('access_token', access);
        localStorage.setItem('refresh_token', refresh);
        
        if (userData) {
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            const meRes = await api.get('/accounts/me/');
            setUser(meRes.data);
            localStorage.setItem('user', JSON.stringify(meRes.data));
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
