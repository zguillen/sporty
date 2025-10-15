import React from 'react';

const Dashboard = ({ user }) => {
    if (!user) {
        return (
            <div className="dashboard">
                <p>Please log in to view your dashboard.</p>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <h1>Welcome, {user.displayName || user.email}</h1>
            <p>Dashboard coming soon...</p>
        </div>
    );
};

export default Dashboard;
