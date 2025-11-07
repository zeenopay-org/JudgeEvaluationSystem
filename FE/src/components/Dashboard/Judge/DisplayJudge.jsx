import React, { useEffect, useState, useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

  const BACKEND_URL = "https://judgeevaluationsystem.onrender.com/api/v1"; 

const DisplayJudge = () => {
  const { token, judge } = useContext(AuthContext);
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [roundsByEvent, setRoundsByEvent] = useState({});
  const [expandedEvent, setExpandedEvent] = useState(null);
  const [loading, setLoading] = useState(true);



  if (!token || !judge) return <Navigate to="/login" replace />;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/judges/events/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error(`Failed to load events (${res.status})`);
        const data = await res.json();
        setEvents(Array.isArray(data.events) ? data.events : []);
      } catch (err) {
       toast.error(err.message || "Error fetching events");
      }
    };

    const fetchRounds = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/judges/rounds/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to load rounds");
        const data = await res.json();

        const grouped = {};
        (data.rounds || []).forEach((r) => {
          const eid = r.event?._id || r.event;
          if (!grouped[eid]) grouped[eid] = [];
          grouped[eid].push(r);
        });
        setRoundsByEvent(grouped);
      } catch (err) {
         toast.error(err.message || "Error fetching rounds");

      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchEvents();
      fetchRounds();
    }
  }, [token]);

  const toggleExpand = (eventId) => {
    setExpandedEvent((prev) => (prev === eventId ? null : eventId));
  };

  if (loading) return <p className="p-6">Loading events...</p>;

  return (
    <div className="p-6 w-full max-w-full">
      <div className="flex items-center mb-6">
        <h2 className="text-2xl font-bold">My Events</h2>
      </div>


      {events.length === 0 ? (
        <p className="text-gray-600">No events assigned.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const isExpanded = expandedEvent === event._id;
            const eventRounds = roundsByEvent[event._id] || [];

            return (
              <div
                key={event._id}
                className="bg-white rounded-xl shadow-md overflow-hidden transition hover:shadow-lg"
              >
                <div
                  className="cursor-pointer relative"
                  onClick={() => toggleExpand(event._id)}
                >
                  {event.image && (
                    <img
                      src={event.image}
                      alt={event.name}
                      className="w-full h-40 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {event.name}
                      </h3>
                      <FontAwesomeIcon
                        icon={isExpanded ? faChevronUp : faChevronDown}
                        className="text-gray-600 text-lg"
                      />
                    </div>
                    {event.created_by && (
                      <p className="text-sm text-gray-500">
                        By <strong>{event.created_by}</strong>
                      </p>
                    )}
                    {event.createdAt && (
                      <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full mt-2">
                        {new Date(event.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-gray-50 border-t border-gray-200 p-4 animate-fadeIn">
                    <h4 className="text-md font-semibold text-gray-700 mb-2">
                      Rounds
                    </h4>
                    {eventRounds.length === 0 ? (
                      <p className="text-sm text-gray-500">
                        No rounds available
                      </p>
                    ) : (
                      <ul className="space-y-2">
                        {eventRounds.map((round) => (
                          <li
                            key={round._id}
                            className="flex justify-between items-center bg-white border rounded-lg px-3 py-2 shadow-sm hover:shadow transition"
                          >
                            <span className="text-sm font-medium text-gray-700">
                              {round.name}
                            </span>
                            <button
                              className="text-blue-600 text-xs font-semibold hover:underline"
                              onClick={() =>
                                navigate(
                                  `/judge/rounds/${round._id}/contestants`
                                )
                              }
                            >
                              View Contestants
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      
        </div>
      )}
    </div>
  );
};

export default DisplayJudge;
