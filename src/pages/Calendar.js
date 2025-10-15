import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import 'react-calendar/dist/Calendar.css';

const CalendarPage = () => {
    const [events, setEvents] = useState([]);
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [selectedAgeRange, setSelectedAgeRange] = useState('');
    const [filteredEvents, setFilteredEvents] = useState([]);

    useEffect(() => {
        fetchEvents();
        fetchTeams();
    }, []);

    useEffect(() => {
        filterEvents();
    }, [events, selectedTeam, selectedAgeRange]);

    const fetchEvents = async () => {
        try {
            const q = query(collection(db, 'events'), where('isPublic', '==', true));
            const querySnapshot = await getDocs(q);
            const eventsData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setEvents(eventsData);
        } catch (error) {
            console.error('Error fetching events:', error);
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
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    const filterEvents = () => {
        let filtered = events;

        if (selectedTeam) {
            filtered = filtered.filter(event => event.teamId === selectedTeam);
        }

        if (selectedAgeRange) {
            filtered = filtered.filter(event => event.ageRange === selectedAgeRange);
        }

        setFilteredEvents(filtered);
    };

    return (
        <div className="calendar-page">
            <h1>Events Calendar</h1>

            <div className="filters">
                <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                >
                    <option value="">All Teams</option>
                    {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                </select>

                <select
                    value={selectedAgeRange}
                    onChange={(e) => setSelectedAgeRange(e.target.value)}
                >
                    <option value="">All Ages</option>
                    <option value="8-12">8-12</option>
                    <option value="13-16">13-16</option>
                    <option value="17+">17+</option>
                </select>
            </div>

            <div className="calendar-container">
                <Calendar />
            </div>

            <div className="events-list">
                <h3>Upcoming Events</h3>
                {filteredEvents.map(event => (
                    <div key={event.id} className="event-card">
                        <h4>{event.title}</h4>
                        <p>{event.description}</p>
                        <p>Date: {new Date(event.date.seconds * 1000).toLocaleDateString()}</p>
                        <p>Team: {teams.find(t => t.id === event.teamId)?.name || 'All Teams'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CalendarPage;
