import React, { useEffect, useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

const DisplayJudge = () => {
  const { token, judge } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Only judges can view this page
  if (!token || !judge) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    const fetchJudgeEvents = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/v1/judges/events/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const msg = `Failed to load events (${res.status})`;
          setError(msg);
          setEvents([]);
          return;
        }

        const data = await res.json();
        setEvents(Array.isArray(data.events) ? data.events : []);
      } catch (err) {
        setError('Error fetching events');
      } finally {
        setLoading(false);
      }
    };

    fetchJudgeEvents();
  }, [token]);

  if (loading) return <p className="p-6">Loading events...</p>;

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold">My Events</h2>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-300 bg-red-50 text-red-800 px-4 py-2">
          {error}
        </div>
      )}

      {events.length === 0 ? (
        <p className="text-gray-600">No events assigned.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {events.map((event) => (
            <div key={event._id || event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {event.image && (
                <img src={event.image} alt={event.name} className="w-full h-48 object-cover" />
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-1">{event.name}</h3>
                {event.created_by && (
                  <p className="text-sm text-gray-500 mb-2">Organized by <strong>{event.created_by}</strong></p>
                )}
                <div className="mb-2">
                  {event.createdAt && (
                    <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full mr-2">
                      {new Date(event.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisplayJudge;