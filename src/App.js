import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TeamArea from './pages/TeamArea';
import AdminPanel from './pages/AdminPanel';
import './App.css';

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <Router basename="/sporty">
            <div className="App">
                <Navbar user={user} />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard user={user} />} />
                    <Route path="/team/:teamId" element={<TeamArea user={user} />} />
                    <Route path="/admin" element={<AdminPanel user={user} />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
