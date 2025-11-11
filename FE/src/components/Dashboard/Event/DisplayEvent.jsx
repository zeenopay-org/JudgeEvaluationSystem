import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../../DeleteModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faUser, faTrash } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../../../context/AuthContext";
import { toast } from "react-toastify";

const BACKEND_URL = "https://judgeevaluationsystem.onrender.com/api/v1";

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
      <div className="flex items-center justify-center min-h-[40vh] text-gray-500 text-sm">
        Loading events...
      </div>
    );

  return (
    <div className="p-4 sm:p-6 md:p-8 relative">
      <div className="mb-6">
        <h2 className="text-base sm:text-xl md:text-2xl font-semibold text-gray-800">
          Ongoing Events
        </h2>
      </div>

      {events.length === 0 ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <button
            onClick={handleCreateClick}
            className="bg-green-600 text-white px-5 py-3 rounded-md shadow hover:bg-green-700 transition text-base flex items-center gap-2"
          >
            <span className="text-lg font-bold">+</span>
            <span>Create Event</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-start">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col relative w-full max-w-sm"
            >
              {event.image && (
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-48 sm:h-56 md:h-64 object-cover rounded-t-xl"
                />
              )}

              <div className="p-4 sm:p-6 flex flex-col flex-grow">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">
                  {event.name}
                </h3>

                {event.created_by && (
                  <p className="text-sm text-gray-500 mb-2">
                    Organized by{" "}
                    <strong className="text-gray-700">
                      {event.created_by}
                    </strong>
                  </p>
                )}

                {event.createdAt && (
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full mb-3 w-fit">
                    {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                )}

                <button
                  onClick={() => promptDelete(event)}
                  className="absolute top-3 right-3 bg-white rounded-lg text-red-600 hover:text-red-700 transition"
                >
                  <FontAwesomeIcon icon={faTrash} className="text-base" />
                </button>

                 <div className="flex items-center justify-between gap-3 mt-auto">
                  <button
                    onClick={() => handleEdit(event)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white font-medium text-sm shadow hover:bg-green-700 transition"
                  >
                    <FontAwesomeIcon icon={faEdit} className="text-xs" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleContestant(event)}
                    className="flex-[1.5] inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white font-medium text-sm shadow hover:bg-red-700 transition"
                  >
                    <FontAwesomeIcon icon={faUser} className="text-xs" />
                    Add Contestant
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteModal
        show={showModal}
        itemName={selectedEvent?.name}
        onConfirm={handleDelete}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
};

export default DisplayEvent;
