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
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState("");
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
      setSelectedContestant(null);
    }
  };

  const handleBulkUpload = async () => {
    if (!file) {
      toast.error("Please select an Excel file first!");
      return;
    }
    if (!selectedEvent) {
      toast.error("Please select an event first!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("eventId", selectedEvent);

    try {
      setUploading(true);
      const res = await fetch(`${BACKEND_URL}/contestants/bulk-upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          `Bulk upload completed successfully! Inserted: ${data.inserted || 0}`
        );
        setShowUpload(false);
        setFile(null);
        setSelectedEvent("");

        // Refresh contestants
        const refreshed = await fetch(`${BACKEND_URL}/contestants`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const refreshedData = await refreshed.json();
        setContestants(refreshedData.contestants || []);
      } else {
        toast.error(data.error || "Bulk upload failed.");
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setUploading(false);
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
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
          Available Contestants
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 text-xs sm:text-sm">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition w-full sm:w-auto"
          >
            {showUpload ? "Close Upload" : "Bulk Upload"}
          </button>

          <div className="text-gray-500 text-center sm:text-left">
            {contestants.length} contestant{contestants.length !== 1 ? "s" : ""}{" "}
            found
          </div>
        </div>
      </div>

      {/* 🧾 Bulk Upload Section */}
      {showUpload && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Event Selector */}
            <select
              value={selectedEvent || ""}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full sm:w-1/3 text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Event</option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.name}
                </option>
              ))}
            </select>

            {/* File Input */}
            <input
              type="file"
              accept=".csv, .xlsx"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm border border-gray-300 rounded-md cursor-pointer file:mr-3 file:py-2 file:px-3 file:border-0 file:bg-green-600 file:text-white hover:file:bg-green-700"
            />

            {/* Upload Button */}
            <button
              onClick={handleBulkUpload}
              disabled={!file || !selectedEvent || uploading}
              className={`px-4 py-2 rounded-md text-white ${
                uploading || !selectedEvent
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      )}

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
