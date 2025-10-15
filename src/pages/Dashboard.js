import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

const Dashboard = ({ user }) => {
    const [userRole, setUserRole] = useState(null);
    const [userTeams, setUserTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // Fetch user role
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    setUserRole(userDoc.data().role);
                }

                // Fetch teams user has access to
                const teamsQuery = query(
                    collection(db, 'teams'),
                    where('members', 'array-contains', user.uid)
                );
                const managedTeamsQuery = query(
                    collection(db, 'teams'),
                    where('managers', 'array-contains', user.uid)
                );

                const [memberTeamsSnapshot, managedTeamsSnapshot] = await Promise.all([
                    getDocs(teamsQuery),
                    getDocs(managedTeamsQuery)
                ]);

                const memberTeams = memberTeamsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    accessType: 'member'
                }));

                const managedTeams = managedTeamsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    accessType: 'manager'
                }));

                // Combine and deduplicate teams
                const allTeams = [...memberTeams, ...managedTeams];
                const uniqueTeams = allTeams.reduce((acc, team) => {
                    const existing = acc.find(t => t.id === team.id);
                    if (!existing) {
                        acc.push(team);
                    } else if (team.accessType === 'manager' && existing.accessType === 'member') {
                        // Upgrade to manager if user has both roles
                        existing.accessType = 'manager';
                    }
                    return acc;
                }, []);

                setUserTeams(uniqueTeams);
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [user]);

    if (!user) {
        return (
            <div className="dashboard">
                <p>Please log in to view your dashboard.</p>
            </div>
        );
    }

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    return (
        <div className="dashboard">
            <h1>Welcome, {user.displayName || user.email}</h1>
            <p>Role: <span className={`role-badge ${userRole}`}>{userRole || 'member'}</span></p>

            <div className="dashboard-actions">
                {userRole === 'admin' && (
                    <Link to="/admin" className="admin-link">
                        🔐 Admin Panel
                    </Link>
                )}

                {/* Teams Section */}
                <div className="dashboard-section">
                    <h3>Your Teams ({userTeams.length})</h3>
                    {userTeams.length > 0 ? (
                        <div className="teams-grid">
                            {userTeams.map(team => (
                                <Link
                                    key={team.id}
                                    to={`/team/${team.id}`}
                                    className="team-link-card"
                                >
                                    <div className="team-card-content">
                                        <h4>{team.name}</h4>
                                        <p>Age Range: {team.ageRange || 'Not specified'}</p>
                                        <p>Members: {team.members?.length || 0}</p>
                                        <span className={`access-badge ${team.accessType}`}>
                                            {team.accessType}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p>You are not a member of any teams yet. Contact an admin to join a team.</p>
                    )}
                </div>

                <div className="dashboard-section">
                    <h3>Quick Actions</h3>
                    <p>Dashboard functionality coming soon...</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
