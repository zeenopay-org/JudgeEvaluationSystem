import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const BACKEND_URL = "http://localhost:5000/api/v1"; 

const CreateContestant = () => {
  const [contestantName, setContestantName] = useState('');
  const [contestant_number, setContestantNumber] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { token } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { eventId: eventIdFromParams } = useParams();

  const eventId =
    eventIdFromParams ||
    location.state?.eventId ||
    (typeof window !== 'undefined' ? localStorage.getItem('selectedEventId') : '');

  // Preview selected image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!eventId) {
      toast.error('Missing event context. Please start from the Events page.');
      return;
    }

    if (!contestantName || !contestant_number) {
      toast.error('Please fill out all fields.');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare FormData
      const formData = new FormData();
      formData.append('name', contestantName);
      formData.append('contestant_number', Number(contestant_number));
      formData.append('eventId', eventId);
      if (image) formData.append('image', image);

      const res = await fetch(`${BACKEND_URL}/contestants/create`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      console.log('Response:', data);

      if (res.ok) {
        toast.success('Contestant created successfully!');
        setContestantName('');
        setContestantNumber('');
        setImage(null);
        setPreview(null);
        localStorage.removeItem('selectedEventId');
        navigate('/contestant');
      } else {
        toast.error(data.error || 'Failed to create contestant');
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
      <h2 className="text-xl font-bold mb-4">Add New Contestant</h2>

      {/* {eventId && (
        <p className="mb-2 text-sm text-gray-600">
          For Event: <span className="font-medium">{eventId}</span>
        </p>
      )} */}

      <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
        <div>
          <label htmlFor="contestant-name" className="block text-sm font-medium text-gray-700">
            Contestant Name
          </label>
          <input
            type="text"
            id="contestant-name"
            value={contestantName}
            onChange={(e) => setContestantName(e.target.value)}
            placeholder="Enter the name of the contestant"
            className="mt-1 text-sm block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        <div>
          <label htmlFor="contestant_number" className="block text-sm font-medium text-gray-700">
            Contestant Number
          </label>
          <input
            type="number"
            id="contestant_number"
            value={contestant_number}
            onChange={(e) => setContestantNumber(e.target.value)}
            placeholder="Enter the contestant number"
            className="mt-1 text-sm block w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Image Upload Field */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700">
            Contestant Image
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="mt-1  text-sm block w-full border border-gray-300 rounded-md p-2"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-3 w-32 h-32 object-cover rounded-md border"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md transition ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          } text-white`}
        >
          {isLoading ? 'Creating Contestant...' : 'Create Contestant'}
        </button>
      </form>
    </div>
  );
};

export default CreateContestant;
