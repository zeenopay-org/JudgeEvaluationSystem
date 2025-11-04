import { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { toast } from 'react-toastify';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [eventName, setEventName] = useState('');
  const [imageFile, setImageFile] = useState(null); 
  const [imagePreview, setImagePreview] = useState(''); 
  const [organizer, setOrganizer] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch existing event data
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id || !token) return;
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/v1/events/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data?.event) {
          setEventName(data.event.name || '');
          setImagePreview(data.event.image || '');
          setOrganizer(data.event.created_by || '');
        } else {
          toast.error(data.message || data.error || 'Failed to load event');
        }
      } catch (err) {
        toast.error('Network error while loading event');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id, token]);

  // Submit updated event
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!eventName || !organizer) {
      toast.error('Please fill out all fields.');
      return;
    }

    setIsLoading(true);

    const formData = new FormData();
    formData.append('name', eventName);
    formData.append('created_by', organizer);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const res = await fetch(`http://localhost:5000/api/v1/events/edit/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success('Event updated successfully');
        navigate('/event', { state: { success: 'Event updated successfully' } });
      } else {
        toast.error(data.message || data.error || 'Failed to edit event');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Network error. Please check if the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Edit Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="event-name" className="block text-sm font-medium text-gray-700">
            Event Name
          </label>
          <input
            type="text"
            id="event-name"
            name="event-name"
            placeholder="Enter the name of the event"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            className="mt-1 text-sm block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Image
          </label>
          {imagePreview && (
            <div className="mb-2">
              <p className="text-sm text-gray-500">Current Image:</p>
              <img src={imagePreview} alt="Current" className="w-48 h-auto rounded-md mt-1" />
            </div>
          )}
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
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
            placeholder="Enter the name of organizer"
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
            className="mt-1  text-sm block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md transition ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            } text-white`}
          >
            {isLoading ? 'Updating...' : 'Update Event'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;