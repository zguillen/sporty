import React from 'react';
import { useParams } from 'react-router-dom';

const TeamArea = ({ user }) => {
    const { teamId } = useParams();

    if (!user) {
        return (
            <div className="team-area">
                <p>Please log in to view team area.</p>
            </div>
        );
    }

    return (
        <div className="team-area">
            <h1>Team Area</h1>
            <p>Team ID: {teamId}</p>
            <p>Team area coming soon...</p>
        </div>
    );
};

export default TeamArea;
