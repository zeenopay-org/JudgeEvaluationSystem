import { useState,useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eventName, setEventName] = useState('');
  const [image, setImage] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id || !token) return;
      setIsLoading(true);
      setErrorMessage('');
      try {
        const res = await fetch(`http://localhost:5000/api/v1/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data?.event) {
          setEventName(data.event.name || '');
          setImage(data.event.image || '');
          setOrganizer(data.event.created_by || '');
        } else {
          setErrorMessage(data.message || data.error || 'Failed to load event');
        }
      } catch (err) {
        setErrorMessage('Network error while loading event');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id, token]);

  const handleSubmit = async (e)=>{
    e.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

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
        
        if (!isValidImageUrl(image.trim())) {
            setErrorMessage('Please enter a valid image URL (jpg, png, jpeg, etc).');
            return;
        }
        
        setIsLoading(true);

        const payload = {
            name: eventName,
            created_by: organizer,
            image: image.trim()
          };

          console.log({ eventName, image, organizer });
          try {
            const res = await fetch(`http://localhost:5000/api/v1/events/edit/${id}`,
              {
                method:'PUT',
                headers:{
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(payload)
              });
      
              const data = await res.json();
              console.log('Response:', data);
             
              if (res.ok) {
                setSuccessMessage('Event updated successfully');
                navigate('/event', { state: { success: 'Event updated successfully' } });
              } else {
                setErrorMessage(data.message || data.error || 'Failed to edit event');
              }
            } catch (error) {
              console.error('Error:', error);
              setErrorMessage('Network error. Please check if the server is running.');
            } finally {
              setIsLoading(false);
            }

        }

  // Fetch event data using the ID and populate the form
  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Edit Event</h2>
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
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="organizer" className="block text sm font-medium text-gray-700">
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
            {isLoading ? 'Loading...' : 'Update Event'}
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

export default EditEvent;