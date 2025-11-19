import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate, Navigate } from "react-router-dom";
import DeleteModal from "../../DeleteModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faUpload,
  faUser,
  faCalendar,
  faEnvelope,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
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
      <div className="p-6 flex justify-center items-center h-64 text-sm text-gray-600 animate-pulse">
        Loading contestants...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 relative">
        <div className="pr-14 sm:pr-0">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-green-500 to-green-700 rounded-full"></span>
            Available Contestants
          </h2>
          <p className="text-sm text-gray-500 mt-2 ml-4">
            {contestants.length} contestant{contestants.length !== 1 ? "s" : ""}{" "}
            found
          </p>
        </div>

        <button
          onClick={() => setShowUpload(!showUpload)}
          className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2 font-semibold
          w-12 h-12 sm:w-auto sm:h-auto sm:px-6 sm:py-2.5 justify-center"
        >
          <FontAwesomeIcon icon={faUpload} className="sm:text-base" />
          <span className="hidden sm:inline">
            {showUpload ? "Close Upload" : "Bulk Upload"}
          </span>
        </button>
      </div>

      {/* Bulk Upload Section */}
      {showUpload && (
        <div className="mb-8 p-6 border-2 border-green-200 rounded-2xl bg-gradient-to-br from-green-50 to-white shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>
              <FontAwesomeIcon icon={faUpload} className="sm:text-base" />
            </span>
            Bulk Upload Contestants
          </h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Event
              </label>
              <select
                value={selectedEvent || ""}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              >
                <option value="">Choose an event...</option>
                {events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload File
              </label>
              <input
                type="file"
                accept=".csv, .xlsx"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full border-2 border-gray-300 rounded-lg cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-600 file:text-white file:font-semibold hover:file:bg-green-700 transition-all"
              />
            </div>

            <button
              onClick={handleBulkUpload}
              disabled={!file || !selectedEvent || uploading}
              className={`px-6 py-2.5 rounded-lg text-white font-semibold shadow-md transition-all duration-200 ${
                uploading || !selectedEvent || !file
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-lg transform hover:-translate-y-0.5"
              }`}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      )}

      {/* Contestants Grid */}
      {contestants.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-7xl mb-4">
            {" "}
            <FontAwesomeIcon icon={faUser} />
            );
          </div>
          <p className="text-gray-500 text-lg">No contestants found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {contestants.map((c, index) => (
            <div
              key={c._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-2"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Contestant Image */}
              <div className="relative w-full h-56 bg-gradient-to-br from-green-100 to-green-200 overflow-hidden">
                {c.image ? (
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-6xl opacity-50"
                    />
                    );
                  </div>
                )}

                {/* Number Badge */}
                <div className="absolute top-3 left-3 h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                  {c.contestant_number || c.number || "?"}
                </div>
              </div>

              {/* Contestant Info */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-green-600 transition-colors">
                  {c.name || "Unknown"}
                </h3>

                <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                  {getEventName(c.event)}
                </p>

                {c.email && (
                  <p className="text-xs text-gray-600 mb-1 flex items-center gap-1 truncate">
                    <FontAwesomeIcon
                      icon={faEnvelope}
                      className="sm:text-base"
                    />{" "}
                    {c.email}
                  </p>
                )}
                {c.phone && (
                  <p className="text-xs text-gray-600 mb-3 flex items-center gap-1">
                    <FontAwesomeIcon icon={faPhone} className=" text-sm" />
                    {c.phone}
                  </p>
                )}

                {role === "admin" && (
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() =>
                        navigate(`/contestant/edit/${c._id}`, {
                          state: { contestant: c },
                        })
                      }
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                      Edit
                    </button>
                    <button
                      onClick={() => promptDelete(c)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteModal
        show={showModal}
        itemName={selectedContestant?.name}
        onConfirm={handleDelete}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
};

export default DisplayContestant;
