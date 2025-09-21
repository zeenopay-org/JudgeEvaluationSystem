import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';


const CreateEvent = () => {
  const [eventName, setEventName] = useState('');
  const [image, setImage] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous messages
    setErrorMessage('');
    setSuccessMessage('');

    //image validation
    const isValidImageUrl = (url) => {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.svg'];
      try {
        const parsedUrl = new URL(url);
        return imageExtensions.some(ext => parsedUrl.pathname.toLowerCase().endsWith(ext));
      } catch {
        return false; 
      }
    };
    
    // Basic validation
    if (!eventName || !organizer || !image || !image.trim()) {
      setErrorMessage('Please fill out all fields.');
      return;
    }

    if (!isValidImageUrl(image.trim())) {
      setErrorMessage('Please enter a valid image URL (jpg, png, jpeg, etc).');
      return;
    }
    
    setIsLoading(true);

    //send data
    const payload = {
      name: eventName,
      created_by: organizer,
      image: image.trim()
    };
    
    // form submission 
    console.log({ eventName, image, organizer });
    try {
      const res = await fetch('http://localhost:5000/api/v1/events/create',
        {
          method:'POST',
          headers:{
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log('Response:', data);
       
        if (res.status === 200 || res.status === 201) {
          setSuccessMessage('Event created successfully');
          setEventName('');
          setOrganizer('');
          setImage('');
        } else {
          setErrorMessage(data.message || data.error || 'Failed to create event');
        }
      } catch (error) {
        console.error('Error:', error);
        setErrorMessage('Network error. Please check if the server is running.');
      } finally {
        setIsLoading(false);
      }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create New Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="event-name" className="block text-sm font-medium text-gray-700">
            Event Name
          </label>
          <input
            type="text"
            id="event-name"
            name="event-name"
            placeholder='enter the name of the event'
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Image
          </label>
          <input
            type="text"
            id="image"
            name="image"
            onChange={(e) => setImage(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="organizer" className="block text-sm font-medium text-gray-700">
            Organizer
          </label>
          <input
            type="text"
            id="organizer"
            name="organizer"
            placeholder='enter the name of organizer '
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md transition ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {isLoading ? 'Creating Event...' : 'Create Event'}
          </button>
          
          {successMessage && (
            <p className="mt-2 text-green-600 text-center">{successMessage}</p>
          )}
          
          {errorMessage && (
            <p className="mt-2 text-red-600 text-center">{errorMessage}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateEvent;