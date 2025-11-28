import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../../DeleteModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faUser,
  faTrash,
  faCalendar,
  // faPartyHorn,
} from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../../../context/AuthContext";
import { toast } from "react-toastify";

const BACKEND_URL = "https://judgeevaluationsystem.onrender.com/api/v1";
  // const BACKEND_URL = "http://localhost:5000/api/v1";

const DisplayEvent = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const toastShownRef = useRef(false);

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

  const promptDelete = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    try {
      const res = await fetch(
        `${BACKEND_URL}/events/delete/${selectedEvent._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e._id !== selectedEvent._id));
        toast.success(`${selectedEvent.name} deleted successfully!`);
      } else {
        toast.error("Failed to delete event");
      }
    } catch (err) {
      toast.error(`Error deleting event: ${err.message || err}`);
    } finally {
      setShowModal(false);
      setSelectedEvent(null);
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
      <div className="flex items-center justify-center min-h-[40vh] text-gray-500 text-sm animate-pulse">
        Loading events...
      </div>
    );

  return (
    <div className="p-2 sm:p-4 lg:p-2 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-md sm:text-xl font-bold text-gray-800 flex items-center gap-3">
          <span className="w-1 h-8 bg-gradient-to-b from-green-500 to-green-700 rounded-full"></span>
          Ongoing Events
        </h2>
      </div>

      {/* If no events */}
      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <FontAwesomeIcon icon={faCalendar} />
          <p className="text-gray-500 text-lg">No events yet</p>
          <button
            onClick={handleCreateClick}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3 text-lg font-semibold"
          >
            <span className="text-2xl font-bold">+</span>
            <span>Create Event</span>
          </button>
        </div>
      ) : (
        // Responsive Grid - Optimized width
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {events.map((event, index) => (
            <div
              key={event._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-2 animate-fadeIn"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Event Image */}
              <div className="relative">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                    {/* <FontAwesomeIcon icon={faPartyHorn} /> */}
                  </div>
                )}

                {/* Delete Button */}
                <button
                  onClick={() => promptDelete(event)}
                  className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm p-2.5 rounded-lg shadow-md text-red-600 hover:text-white hover:bg-red-600 transition-all duration-200 transform hover:scale-110"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-sm" />
                </button>
              </div>

              {/* Event Info */}
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                  {event.name}
                </h3>

                {event.created_by && (
                  <p className="text-sm text-gray-600 mb-3">
                    Organized by{" "}
                    <strong className="text-green-600 font-semibold">
                      {event.created_by}
                    </strong>
                  </p>
                )}

                {event.createdAt && (
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 w-fit shadow-sm">
                    <FontAwesomeIcon icon={faCalendar} />
                    {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2.5 mt-auto">
                  <button
                    onClick={() => handleEdit(event)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    Edit Event
                  </button>

                  <button
                    onClick={() => handleContestant(event)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border-2 border-green-500 text-green-600 font-semibold text-sm hover:bg-green-50 transition-all duration-200 transform hover:-translate-y-0.5"
                  >
                    <FontAwesomeIcon icon={faUser} />
                    Add Contestant
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        show={showModal}
        itemName={selectedEvent?.name}
        onConfirm={handleDelete}
        onCancel={() => setShowModal(false)}
      />

      {/* Add animation styles */}
    </div>
  );
};

export default DisplayEvent;
