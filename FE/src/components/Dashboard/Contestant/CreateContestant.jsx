import React, { useState, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';


const CreateContestant = () => {
  const [contestantName, setContestantName] = useState('');
  const [contestant_number, setContestantNumber] = useState('');
   const [isLoading, setIsLoading] = useState(false);
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const { eventId: eventIdFromParams } = useParams();
  const eventId = eventIdFromParams || location.state?.eventId || (typeof window !== 'undefined' ? localStorage.getItem('selectedEventId') : '');

  const handleSubmit = async (e) => {
    e.preventDefault();


    // Ensure we have an event id
    if (!eventId) {
      toast.error('Missing event context. Please start from the Events page.');
      return;
    }
    
    // Basic validation
    if (!contestantName || !contestant_number) {
      toast.error('Please fill out all fields.');
      return;
    }

     setIsLoading(true);

    //send data
    const payload = {
      name: contestantName,
      contestant_number: Number(contestant_number),
      eventId: eventId,
    };
    
    // form submission 
    console.log({ contestantName, contestant_number, eventId });
    try {
      const res = await fetch('http://localhost:5000/api/v1/contestants/create',
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
            setContestantName('');
          setContestantNumber('');
          try { localStorage.removeItem('selectedEventId'); } catch {}
          
        // return to event page with banner
        localStorage.setItem('contestantCreated', 'true');

          navigate('/contestant');
        } else {
          toast.error(data.message || data.error || 'Failed to create contestant');
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
      <h2 className="text-2xl font-bold mb-4">Add new Contestant </h2>
      {eventId && (
        <p className="mb-2 text-sm text-gray-600">For Event: <span className="font-medium">{eventId}</span></p>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="contestant-name" className="block text-sm font-medium text-gray-700">
            Contestant Name
          </label>
          <input
            type="text"
            id="contestant-name"
            name="contestant-name"
            placeholder='enter the name of the contestant'
            value={contestantName}
            onChange={(e) => setContestantName(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
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
            name="contestant_number"
            placeholder='enter the number of contestant '
            value={contestant_number}
            onChange={(e) => setContestantNumber(e.target.value)}
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
            {isLoading ? 'Creating contestant' : 'Create Contestant'}
          </button>
          
                  </div>
      </form>
    </div>
  );
};

export default CreateContestant;