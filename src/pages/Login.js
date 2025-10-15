import React, { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleGoogleSignIn = async () => {
        setError('');
        setLoading(true);

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if user document exists, if not create it
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                await setDoc(userDocRef, {
                    name: user.displayName,
                    email: user.email,
                    role: 'member',
                    teams: [],
                    createdAt: new Date()
                });
            }

            navigate('/dashboard');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-form">
                <h2>Welcome to Basketball Club</h2>
                <p>Sign in to access your account</p>

                {error && <p className="error">{error}</p>}

                <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="google-signin-btn"
                >
                    {loading ? 'Signing in...' : 'Sign in with Google'}
                </button>
            </div>
        </div>
    );
};

export default Login;
