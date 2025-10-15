import React from 'react';

const AdminPanel = ({ user }) => {
    if (!user) {
        return (
            <div className="admin-panel">
                <p>Please log in to access admin panel.</p>
            </div>
        );
    }

    return (
        <div className="admin-panel">
            <h1>Admin Panel</h1>
            <p>Admin functionality coming soon...</p>
        </div>
    );
};

export default AdminPanel;
