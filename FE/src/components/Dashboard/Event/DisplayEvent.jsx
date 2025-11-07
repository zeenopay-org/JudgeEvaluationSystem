import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faPerson, faTrash } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../../../context/AuthContext";
import { toast } from "react-toastify";

const BACKEND_URL = "https://judgeevaluationsystem.onrender.com/api/v1";

const DisplayEvent = ({ eventId }) => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const toastShownRef = useRef(false);

  // truncate long text for mobile
  const truncateByLetters = (text, maxLength) =>
    text && text.length > maxLength
      ? text.slice(0, maxLength) + "..."
      : text || "";

  const handleCreateClick = () => navigate("/");
  const handleEdit = (event) => navigate(`/event/edit/${event._id}`);
  const handleContestant = (event) => {
    localStorage.setItem("selectedEventId", event._id);
    navigate(`/contestant/create/${event._id}`, {
      state: { eventId: event._id },
    });
  };

  const handleDelete = async (event) => {
    if (confirm(`Are you sure you want to delete ${event.name}?`)) {
      try {
        const res = await fetch(
          `${BACKEND_URL}/events/delete/${event._id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          setEvents((prev) => prev.filter((e) => e._id !== event._id));
          toast.success(`${event.name} deleted successfully!`);
        } else toast.error("Failed to delete event");
      } catch (err) {
        toast.error(`Error deleting event: ${err.message || err}`);
      }
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      if (!token) return setLoading(false);
      try {
        const res = await fetch(`${BACKEND_URL}/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (Array.isArray(data.events)) {
          setEvents(
            data.events.map((e) => ({
              ...e,
              created_by: truncateByLetters(e.created_by, 25),
            }))
          );
        } else setEvents([]);
      } catch (err) {
        toast.error("Failed to load events. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [token]);

  useEffect(() => {
    const created = localStorage.getItem("eventCreated");
    if (created === "true" && !toastShownRef.current) {
      toast.success("Event created successfully!");
      localStorage.removeItem("eventCreated");
      toastShownRef.current = true;
    }
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-gray-500 text-sm">
        Loading events...
      </div>
    );

  return (
    <div className="p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
          Ongoing Events
        </h2>
        <button
          onClick={handleCreateClick}
          className="bg-green-600 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-md shadow hover:bg-green-700 transition duration-200 text-sm sm:text-base w-full sm:w-auto"
        >
          Create Event
        </button>
      </div>

      {/* Events Grid */}
      <div
        className="grid gap-6 sm:gap-7 md:gap-8 
        grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
      >
        {events.length === 0 ? (
          <p className="text-gray-500 text-center col-span-full text-sm sm:text-base">
            No events found.
          </p>
        ) : (
          events.map((event) => (
            <div
              key={event._id || event.id}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              {event.image && (
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-44 sm:h-48 md:h-52 object-cover rounded-t-xl"
                />
              )}

              <div className="p-4 sm:p-5 flex flex-col flex-grow">
                {/* Title + Organizer */}
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
                  {event.name}
                </h3>

                {event.created_by && (
                  <p className="text-xs sm:text-sm text-gray-500 mb-2">
                    Organized by{" "}
                    <strong className="text-gray-700">
                      {event.created_by}
                    </strong>
                  </p>
                )}

                {event.createdAt && (
                  <span className="inline-block bg-green-100 text-green-800 text-[10px] sm:text-xs font-medium px-3 py-1 rounded-full mb-3 w-fit">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                )}

                {/* Action Buttons */}
                <div className="mt-auto space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleEdit(event)}
                      className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 text-xs sm:text-sm font-medium shadow transition"
                    >
                      <FontAwesomeIcon
                        icon={faEdit}
                        className="text-[10px] sm:text-xs"
                      />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(event)}
                      className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 text-xs sm:text-sm font-medium shadow transition"
                    >
                      <FontAwesomeIcon
                        icon={faTrash}
                        className="text-[10px] sm:text-xs"
                      />
                      Delete
                    </button>
                  </div>

                  <button
                    onClick={() => handleContestant(event)}
                    className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 transition text-xs sm:text-sm font-medium shadow"
                  >
                    <FontAwesomeIcon
                      icon={faPerson}
                      className="text-[10px] sm:text-xs"
                    />
                    Add Contestant
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DisplayEvent;
