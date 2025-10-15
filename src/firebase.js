import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: "AIzaSyDq4nCXhnmKq2L_S-RzsTSw9JMvVq7HDFY",
    authDomain: "sporty-fd68c.firebaseapp.com",
    projectId: "sporty-fd68c",
    storageBucket: "sporty-fd68c.firebasestorage.app",
    messagingSenderId: "738389787687",
    appId: "1:738389787687:web:2b0c6c960da207a1cf3a02",
    measurementId: "G-1WFVLZ6RJ6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export default app;
