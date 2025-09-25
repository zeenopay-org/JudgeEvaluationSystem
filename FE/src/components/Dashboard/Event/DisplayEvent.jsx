import React, { useEffect, useState ,useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faPerson, faTrash } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../../context/AuthContext';

const DisplayEvent = ({eventId}) => {
 const { token, } = useContext(AuthContext);
 const navigate = useNavigate();
 const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
 

  const handleCreateClick = () => {
    navigate('/');
  };

  const handleEdit = (event) => {
     navigate(`/event/edit/${event._id}`);
    };

    const handleContestant = (event) =>{
      try { localStorage.setItem('selectedEventId', event._id); } catch {}
      navigate(`/contestant/create/${event._id}`, { state: { eventId: event._id } });
    }

  const handleDelete = async (event) => {
    if (confirm(`Are you sure you want to delete ${event.name}?`)) {
      try {
        const res = await fetch(`http://localhost:5000/api/v1/events/delete/${event._id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`, 
          }
        });

        if (res.ok) {
          setEvents(prev => prev.filter(e => e._id !== event._id));
        } else {
          console.error('Failed to delete event');
        }
      } catch (err) {
        console.error('Error deleting event:', err);
      }
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {

      if (!token) {
        console.error("No token available");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('http://localhost:5000/api/v1/events', {
          headers: {
            Authorization: `Bearer ${token}`,
            }
        });

        const data = await res.json();
        setEvents(Array.isArray(data.events) ? data.events : []);
      } catch (err) {
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [token]);

  // Show success message from navigation state once
  useEffect(() => {
    if (location.state?.success) {
      setSuccessMessage(location.state.success);
      // Clear the state so the message doesn't persist on refresh/back
      window.history.replaceState({}, document.title, window.location.pathname);
      const t = setTimeout(() => setSuccessMessage(''), 2000);
      return () => clearTimeout(t);
    }
  }, [location.state]);

  if (loading) return <p className="p-6">Loading events...</p>;

  return (
    <div className="p-6">
      {successMessage && (
        <div className="mb-4 rounded border border-green-300 bg-green-50 text-green-800 px-4 py-2">
          {successMessage}
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold ">Ongoing Events</h2>
        <button
          onClick={handleCreateClick}
          className="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 transition duration-200"
        >
          Create Event
        </button>
      </div>

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
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleEdit(event)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors text-sm shadow"
                >
                  <FontAwesomeIcon icon={faEdit} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(event)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors text-sm shadow"
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Delete
                </button>
                
              </div>
              <button
                  onClick={() => handleContestant(event)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 mt-2 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors text-sm shadow"
                >
                  <FontAwesomeIcon icon={faPerson} />
                  Add contestant
                </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DisplayEvent;