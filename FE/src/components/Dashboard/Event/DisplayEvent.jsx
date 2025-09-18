import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';

const DisplayEvent = () => {
  const navigate = useNavigate();

  const handleCreateClick = () => {
    navigate('/');
  };

  const handleEdit = (event) => {
    console.log('Edit event clicked:', event);

  };

  const handleDelete = (event) => {
    console.log('Delete event clicked:', event);
    if (confirm(`Are you sure you want to delete ${event.name}?`)) {
  
    }
  };

  const events = [
    {
      name: 'Miss Nepal',
      image: 'https://via.placeholder.com/600x300',
      organizer: 'Innovate Nepal',
      date: 'September 25, 2025',
      location: 'Kathmandu ',
      
    },
    {
      name: 'Mr.Nepal',
      image: 'https://via.placeholder.com/600x300',
      organizer: 'Code for Nepal',
      date: 'October 10, 2025',
      location: 'Pokhara ',

    },
    {
      name: 'Miss +2',
      image: 'https://via.placeholder.com/600x300',
      organizer: 'Nepal Art Council',
      date: 'November 5, 2025',
      location: 'Kagthmandu',
     
    }
  ];

  return (
    <>
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Events</h2>
        <button
          onClick={handleCreateClick}
          className="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 transition duration-200"
        >
          Create Event
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {events.map((event, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img src={event.image} alt={event.name} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-1">{event.name}</h3>
              <p className="text-sm text-gray-500 mb-2">Organized by <strong>{event.organizer}</strong></p>
              <div className="mb-2">
                <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full mr-2">
                  {event.date}
                </span>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                  {event.location}
                </span>
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
              </div>
          </div>
        ))}
      </div>
    </div>
    </>
  );

};

export default DisplayEvent;