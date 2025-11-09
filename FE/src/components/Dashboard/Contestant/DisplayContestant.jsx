import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import DeleteModal from "../../DeleteModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

const BACKEND_URL = "https://judgeevaluationsystem.onrender.com/api/v1";

const DisplayContestant = () => {
  const { token, admin, judge } = useContext(AuthContext);
  const navigate = useNavigate();
  const [contestants, setContestants] = useState([]);
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedContestant, setSelectedContestant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [judgeEventName, setJudgeEventName] = useState("");

  const role = admin ? "admin" : judge ? "judge" : null;

  if (!role) return <Navigate to="/login" replace />;

  const getEventName = (eventRef) => {
    if (role === "judge") return judgeEventName || "Your Event";
    if (!eventRef) return "Unknown Event";
    if (typeof eventRef === "object") {
      if (eventRef.name) return eventRef.name;
      const eventObj = events.find(
        (e) => e._id === eventRef._id || e.id === eventRef.id
      );
      return eventObj ? eventObj.name : "Unknown Event";
    }
    const eventObj = events.find(
      (e) => e._id === eventRef || e.id === eventRef
    );
    return eventObj ? eventObj.name : "Unknown Event";
  };

  const promptDelete = (contestant) => {
    setSelectedContestant(contestant);
    setShowModal(true);
  };

  const handleDelete = async (contestant) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/contestants/delete/${selectedContestant._id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setContestants((prev) =>
          prev.filter((c) => c._id !== selectedContestant._id)
        );
        toast.success(`${selectedContestant.name} deleted successfully!`);
      } else {
        toast.error("Failed to delete contestant");
      }
    } catch (err) {
      toast.error(`Error deleting contestant: ${err.message || err}`);
    } finally {
      setShowModal(false);
      setSelectedRound(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        toast.error("No token available");
        setLoading(false);
        return;
      }

      try {
        if (role === "judge") {
          const res = await fetch(`${BACKEND_URL}/judges/contestants/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          const fetchedContestants = Array.isArray(data.contestants)
            ? data.contestants
            : [];
          setContestants(fetchedContestants);
          if (typeof data.event === "string") setJudgeEventName(data.event);
        } else {
          const contestantsRes = await fetch(`${BACKEND_URL}/contestants`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const contestantsData = await contestantsRes.json();
          const fetchedContestants = Array.isArray(contestantsData.contestants)
            ? contestantsData.contestants
            : [];
          setContestants(fetchedContestants);

          // Fetch events only for admin
          const eventsRes = await fetch(`${BACKEND_URL}/events`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const eventsData = await eventsRes.json();
          setEvents(Array.isArray(eventsData.events) ? eventsData.events : []);
        }

        setLoading(false);
      } catch (err) {
        console.log("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [token, role, judge]);

  useEffect(() => {
    const created = localStorage.getItem("contestantCreated");
    if (created === "true") {
      toast.success("Contestant added successfully!");
      localStorage.removeItem("contestantCreated");
    }
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64 text-sm text-gray-600">
        Loading contestants...
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">Available Contestants</h2>
        <div className="text-sm text-gray-500">
          {contestants.length} contestant{contestants.length !== 1 ? "s" : ""}{" "}
          found
        </div>
      </div>

      {contestants.length === 0 ? (
        <div className="text-center py-12 text-gray-500 text-lg">
          No contestants found
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contestants.map((c) => (
            <div
              key={c._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Contestant Image */}
              <div className="w-full h-60 bg-gray-100 flex items-center justify-center overflow-hidden">
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-sm">No Image</div>
                )}
              </div>

              {/* Contestant Info */}
              <div className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 text-green-800 flex items-center justify-center font-semibold">
                    {c.contestant_number || c.number || "N/A"}
                  </div>
                  <div>
                    <h3 className="text-md font-semibold text-gray-800">
                      {c.name || "Unknown"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Event: {getEventName(c.event)}
                    </p>
                  </div>
                </div>

                <div className="mt-2">
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                    Contestant #{c.contestant_number || "N/A"}
                  </span>
                </div>

                {c.email && (
                  <div className="mt-2 text-xs text-gray-600">{c.email}</div>
                )}
                {c.phone && (
                  <div className="mt-1 text-xs text-gray-600">{c.phone}</div>
                )}

                {role === "admin" && (

                  
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    
                    <button
                      onClick={() =>
                        navigate(`/contestant/edit/${c._id}`, {
                          state: { contestant: c },
                        })
                      }
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors text-sm shadow"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                      Edit
                    </button>
                    <button
                      onClick={() => promptDelete(c)}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors text-sm shadow"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <DeleteModal
            show={showModal}
            itemName={selectedContestant?.name}
            onConfirm={handleDelete}
            onCancel={() => setShowModal(false)}
          />
        </div>
      )}
    </div>
  );
};

export default DisplayContestant;
