import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import AdminCheck from '../components/AdminCheck';

const AdminPanel = ({ user }) => {
    const [users, setUsers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTeam, setNewTeam] = useState({
        name: '',
        ageRange: '',
        description: ''
    });
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (user) {
            console.log('Current user:', user); // Debug log
            fetchUsers();
            fetchTeams();
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            console.log('Fetching users from Firestore...'); // Debug log
            const querySnapshot = await getDocs(collection(db, 'users'));
            console.log('Raw query snapshot:', querySnapshot); // Debug log
            console.log('Number of docs returned:', querySnapshot.docs.length); // Debug log

            const usersData = querySnapshot.docs.map(doc => {
                const data = { id: doc.id, ...doc.data() };
                console.log('User document:', data); // Debug each user
                return data;
            });

            console.log('Final users array:', usersData); // Debug log
            console.log('Setting users state with:', usersData.length, 'users'); // Debug log
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
            setMessage('Error fetching users: ' + error.message);
        }
    };

    const fetchTeams = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'teams'));
            const teamsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTeams(teamsData);
            console.log('Fetched teams:', teamsData); // Debug log
            setLoading(false);
        } catch (error) {
            console.error('Error fetching teams:', error);
            setLoading(false);
        }
    };

    const promoteUser = async (userId, newRole) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                role: newRole
            });
            setMessage(`User promoted to ${newRole} successfully!`);
            fetchUsers(); // Refresh the list
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error promoting user:', error);
            setMessage('Error promoting user');
        }
    };

    const createTeam = async (e) => {
        e.preventDefault();
        if (!newTeam.name.trim()) {
            setMessage('Team name is required');
            return;
        }

        try {
            await addDoc(collection(db, 'teams'), {
                name: newTeam.name,
                ageRange: newTeam.ageRange,
                description: newTeam.description,
                members: [],
                managers: [],
                createdBy: user.uid,
                createdAt: new Date()
            });

            setMessage('Team created successfully!');
            setNewTeam({ name: '', ageRange: '', description: '' });
            fetchTeams(); // Refresh the list
            setTimeout(() => setMessage(''), 3000);
        } catch (error) {
            console.error('Error creating team:', error);
            setMessage('Error creating team');
        }
    };

    const addUserToTeam = async (teamId, userId) => {
        try {
            const teamRef = doc(db, 'teams', teamId);
            const teamDoc = await getDoc(teamRef);

            if (teamDoc.exists()) {
                const teamData = teamDoc.data();
                const currentMembers = teamData.members || [];

                if (!currentMembers.includes(userId)) {
                    await updateDoc(teamRef, {
                        members: [...currentMembers, userId]
                    });
                    setMessage('User added to team successfully!');
                    fetchTeams(); // Refresh teams
                    setTimeout(() => setMessage(''), 3000);
                } else {
                    setMessage('User is already a member of this team');
                }
            }
        } catch (error) {
            console.error('Error adding user to team:', error);
            setMessage('Error adding user to team');
        }
    };

    const removeUserFromTeam = async (teamId, userId) => {
        try {
            const teamRef = doc(db, 'teams', teamId);
            const teamDoc = await getDoc(teamRef);

            if (teamDoc.exists()) {
                const teamData = teamDoc.data();
                const currentMembers = teamData.members || [];
                const currentManagers = teamData.managers || [];

                await updateDoc(teamRef, {
                    members: currentMembers.filter(id => id !== userId),
                    managers: currentManagers.filter(id => id !== userId)
                });
                setMessage('User removed from team successfully!');
                fetchTeams(); // Refresh teams
                setTimeout(() => setMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error removing user from team:', error);
            setMessage('Error removing user from team');
        }
    };

    const makeTeamManager = async (teamId, userId) => {
        try {
            const teamRef = doc(db, 'teams', teamId);
            const teamDoc = await getDoc(teamRef);

            if (teamDoc.exists()) {
                const teamData = teamDoc.data();
                const currentManagers = teamData.managers || [];
                const currentMembers = teamData.members || [];

                if (!currentManagers.includes(userId)) {
                    // Add to managers and ensure they're also a member
                    const updatedMembers = currentMembers.includes(userId)
                        ? currentMembers
                        : [...currentMembers, userId];

                    await updateDoc(teamRef, {
                        managers: [...currentManagers, userId],
                        members: updatedMembers
                    });
                    setMessage('User promoted to team manager successfully!');
                    fetchTeams(); // Refresh teams
                    setTimeout(() => setMessage(''), 3000);
                } else {
                    setMessage('User is already a manager of this team');
                }
            }
        } catch (error) {
            console.error('Error making user team manager:', error);
            setMessage('Error making user team manager');
        }
    };

    if (!user) {
        return (
            <div className="admin-panel">
                <p>Please log in to access admin panel.</p>
            </div>
        );
    }

    return (
        <AdminCheck user={user} fallback={<div className="admin-panel"><p>Access denied. Admin privileges required.</p></div>}>
            <div className="admin-panel">
                <h1>Admin Panel</h1>

                {message && <div className="message">{message}</div>}

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <>
                        {/* Create Team Section */}
                        <section className="admin-section">
                            <h2>Create New Team</h2>
                            <form onSubmit={createTeam} className="team-form">
                                <div className="form-group">
                                    <label>Team Name *</label>
                                    <input
                                        type="text"
                                        value={newTeam.name}
                                        onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                                        placeholder="Enter team name"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Age Range</label>
                                    <select
                                        value={newTeam.ageRange}
                                        onChange={(e) => setNewTeam({ ...newTeam, ageRange: e.target.value })}
                                    >
                                        <option value="">Select age range</option>
                                        <option value="8-12">8-12 years</option>
                                        <option value="13-16">13-16 years</option>
                                        <option value="17+">17+ years</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        value={newTeam.description}
                                        onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                                        placeholder="Team description (optional)"
                                        rows="3"
                                    />
                                </div>

                                <button type="submit" className="create-btn">Create Team</button>
                            </form>
                        </section>

                        {/* Teams List */}
                        <section className="admin-section">
                            <h2>Teams ({teams.length})</h2>
                            <div className="teams-grid">
                                {teams.map(team => (
                                    <div key={team.id} className="team-card">
                                        <h3>{team.name}</h3>
                                        <p>Age Range: {team.ageRange || 'Not specified'}</p>
                                        <p>Members: {team.members?.length || 0}</p>
                                        <p>Created: {team.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* User Management Section */}
                        <section className="admin-section">
                            <h2>User Management ({users.length} users)</h2>
                            <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f0f0f0', borderRadius: '4px' }}>
                                <strong>Debug Info:</strong>
                                <br />Current user ID: {user?.uid}
                                <br />Users in state: {users.length}
                                <br />User IDs: {users.map(u => u.id).join(', ')}
                                <br />
                                <button onClick={fetchUsers} className="create-btn" style={{ marginTop: '0.5rem' }}>
                                    Refresh Users
                                </button>
                            </div>

                            {users.length === 0 ? (
                                <div>
                                    <p>No users found in component state.</p>
                                    <p>This might be a loading or fetching issue.</p>
                                </div>
                            ) : (
                                <div className="users-table">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Current Role</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(userData => (
                                                <tr key={userData.id}>
                                                    <td>{userData.name || 'No name'}</td>
                                                    <td>{userData.email}</td>
                                                    <td>
                                                        <span className={`role-badge ${userData.role}`}>
                                                            {userData.role || 'member'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {userData.id !== user.uid && (
                                                            <div className="action-buttons">
                                                                {userData.role !== 'admin' && (
                                                                    <button
                                                                        onClick={() => promoteUser(userData.id, 'admin')}
                                                                        className="promote-btn"
                                                                    >
                                                                        Make Admin
                                                                    </button>
                                                                )}
                                                                {userData.role !== 'manager' && (
                                                                    <button
                                                                        onClick={() => promoteUser(userData.id, 'manager')}
                                                                        className="promote-btn manager"
                                                                    >
                                                                        Make Manager
                                                                    </button>
                                                                )}
                                                                {userData.role !== 'member' && (
                                                                    <button
                                                                        onClick={() => promoteUser(userData.id, 'member')}
                                                                        className="demote-btn"
                                                                    >
                                                                        Make Member
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                        {userData.id === user.uid && <span className="current-user">You</span>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </section>

                        {/* Teams Management Section */}
                        <section className="admin-section">
                            <h2>Teams Management ({teams.length})</h2>
                            {teams.map(team => (
                                <div key={team.id} className="team-management-card">
                                    <div className="team-header">
                                        <h3>{team.name}</h3>
                                        <div className="team-info">
                                            <span>Age: {team.ageRange || 'Not specified'}</span>
                                            <span>Members: {team.members?.length || 0}</span>
                                            <span>Managers: {team.managers?.length || 0}</span>
                                        </div>
                                    </div>

                                    {team.description && (
                                        <p className="team-description">{team.description}</p>
                                    )}

                                    <div className="team-members">
                                        <h4>Team Members</h4>
                                        {team.members && team.members.length > 0 ? (
                                            <div className="members-list">
                                                {team.members.map(memberId => {
                                                    const member = users.find(u => u.id === memberId);
                                                    const isManager = team.managers?.includes(memberId);
                                                    return member ? (
                                                        <div key={memberId} className="member-item">
                                                            <span className="member-name">
                                                                {member.name || member.email}
                                                                {isManager && <span className="manager-badge">Manager</span>}
                                                            </span>
                                                            <div className="member-actions">
                                                                {!isManager && (
                                                                    <button
                                                                        onClick={() => makeTeamManager(team.id, memberId)}
                                                                        className="make-manager-btn"
                                                                    >
                                                                        Make Manager
                                                                    </button>
                                                                )}
                                                                <button
                                                                    onClick={() => removeUserFromTeam(team.id, memberId)}
                                                                    className="remove-btn"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : null;
                                                })}
                                            </div>
                                        ) : (
                                            <p>No members yet</p>
                                        )}

                                        <div className="add-member-section">
                                            <h5>Add Members</h5>
                                            <div className="available-users">
                                                {users
                                                    .filter(u => !team.members?.includes(u.id))
                                                    .length > 0 ? (
                                                    users
                                                        .filter(u => !team.members?.includes(u.id))
                                                        .map(availableUser => (
                                                            <div key={availableUser.id} className="available-user">
                                                                <span>{availableUser.name || availableUser.email}</span>
                                                                <button
                                                                    onClick={() => addUserToTeam(team.id, availableUser.id)}
                                                                    className="add-user-btn"
                                                                >
                                                                    Add to Team
                                                                </button>
                                                            </div>
                                                        ))
                                                ) : (
                                                    <p>All users are already members of this team</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </section>
                    </>
                )}
            </div>
        </AdminCheck>
    );
};

export default AdminPanel;
