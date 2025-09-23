import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const DisplayContestant = () => {
  const { token, admin, judge } = useContext(AuthContext);
  const navigate = useNavigate();
  const [contestants, setContestants] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [judgeEventName, setJudgeEventName] = useState('');

  const role = admin ? 'admin' : judge ? 'judge' : null;

  // Redirect if not logged in
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  const getEventName = (eventId) => {
    if (role === 'judge') return judgeEventName || 'Your Event';
    const event = events.find(e => e._id === eventId || e.id === eventId);
    return event ? event.name : 'Unknown Event';
  };

  const handleDelete = async (contestant) => {
    if (confirm(`Are you sure you want to delete ${contestant.name}?`)) {
      try {
        const res = await fetch(
          `http://localhost:5000/api/v1/contestants/delete/${contestant._id}`,
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          setContestants(prev => prev.filter(c => c._id !== contestant._id));
          setSuccessMessage(`${contestant.name} deleted successfully!`);
        } else {
          console.error('Failed to delete contestant');
        }
      } catch (err) {
        console.error('Error deleting contestant:', err);
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        console.error("No token available");
        setLoading(false);
        return;
      }

      try {
        if (role === 'judge') {
          const res = await fetch('http://localhost:5000/api/v1/judges/contestants/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          const fetchedContestants = Array.isArray(data.contestants) ? data.contestants : [];
          setContestants(fetchedContestants);
          if (typeof data.event === 'string') setJudgeEventName(data.event);
        } else {
          const contestantsRes = await fetch('http://localhost:5000/api/v1/contestants', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const contestantsData = await contestantsRes.json();
          const fetchedContestants = Array.isArray(contestantsData.contestants)
            ? contestantsData.contestants
            : [];
          setContestants(fetchedContestants);

          // Fetch events only for admin
          const eventsRes = await fetch('http://localhost:5000/api/v1/events', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const eventsData = await eventsRes.json();
          setEvents(Array.isArray(eventsData.events) ? eventsData.events : []);
        }

        setLoading(false);
      } catch (err) {
        console.log('Error fetching data:', err);
        setLoading(false);
      }
    };

    fetchData();
  }, [token, role, judge]);

  if (loading) {
    return (
      <div className='p-6'>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading contestants...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Contestants</h2>
        <div className="text-sm text-gray-500">
          {contestants.length} contestant{contestants.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {contestants.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 text-lg">No contestants found</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contestants.map((c) => (
            <div key={c._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-semibold">
                    {c.contestant_number || c.number || 'N/A'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{c.name || c.full_name || 'Unknown'}</h3>
                    <p className="text-xs text-gray-500">Event: {getEventName(c.event)}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                    Contestant #{c.contestant_number || c.number || 'N/A'}
                  </span>
                </div>
                {c.email && (
                  <div className="mt-2 text-xs text-gray-600">{c.email}</div>
                )}
                {c.phone && (
                  <div className="mt-1 text-xs text-gray-600">{c.phone}</div>
                )}

                {role === 'admin' && (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors text-sm shadow"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors text-sm shadow"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DisplayContestant;