import React, { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
const displayRound = () => {
    const { token } = useContext(AuthContext);
    const navigate = useNavigate();
    const [successMessage, setSuccessMessage] = useState('');
    const [rounds, setRounds] = useState([]);

    const handleCreateClick = () => {
        navigate('/round/create');
      };

      const handleEdit = (round) => {
        navigate(`/round/edit/${round._id}`);
      };

      const handleDelete = async (round) => {
       if (confirm(`Are you sure you want to delete ${round.name}?`))
       {
        try {
            const res = await fetch(`http://localhost:5000/api/v1/rounds/delete/${round._id}`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.ok){
                setRounds(prev => prev.filter(r => r._id !== round._id));
                setSuccessMessage(`${round.name} deleted successfully!`);
            } else{
                console.error('Failed to delete round');
            }
            
        } catch (err) {
            console.error('Error deleting round:', err);
        }
       }
      };

     
      useEffect(() => {
        if (!token) {
          navigate('/login');
          return;
        }
        
       
        const fetchRounds = async () => {
          try {
            const res = await fetch('http://localhost:5000/api/v1/rounds', {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            if (res.status === 401) {
              setSuccessMessage('');
              navigate('/login');
              return;
            }
            if (!res.ok) {
              throw new Error('Failed to load rounds');
            }
            const data = await res.json();
            setRounds(data.rounds || data);
          } catch (e) {
            console.error(e);
          }
        };
        fetchRounds();
      }, [token, navigate]);

  return (
    <div className="p-6">
    {successMessage && (
      <div className="mb-4 rounded border border-green-300 bg-green-50 text-green-800 px-4 py-2">
        {successMessage}
      </div>
    )}
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold ">Available Rounds</h2>
      <button
        onClick={handleCreateClick}
        className="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 transition duration-200"
      >
        Create Round
      </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {rounds.map((round) => (
        <div key={round._id || round.id} className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-4">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{round.name}</h3>
            <div className="flex flex-wrap gap-2 mb-3">
              {round.type && (
                <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                  Type: {round.type}
                </span>
              )}
              {typeof round.max_score !== 'undefined' && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                  Max Score: {round.max_score}
                </span>
              )}
              {round.event && (
                <span className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
                  Event: {typeof round.event === 'object' ? (round.event.name || round.event._id) : round.event}
                </span>
              )}
            </div>
            {Array.isArray(round.questions) && round.questions.length > 0 && (
  <div className="mt-4 bg-gray-50 p-3 rounded-md border border-gray-200">
    <h4 className="text-sm font-semibold text-gray-700 mb-2">Questions</h4>
    <ul className="space-y-2">
      {round.questions.map((q) => (
        <li
          key={q._id}
          className="text-sm text-gray-600 bg-white border border-gray-100 rounded-md px-3 py-2 shadow-sm"
        >
          {q.question_text}
        </li>
      ))}
    </ul>
  </div>
)}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => handleEdit(round)}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors text-sm shadow"
              >
                <FontAwesomeIcon icon={faEdit} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(round)}
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
  )
}

export default displayRound 