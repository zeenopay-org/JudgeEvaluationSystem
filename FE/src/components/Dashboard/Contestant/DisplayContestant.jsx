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
  faEnvelope,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import Pagination from "../../../utils/Pagination";

const BACKEND_URL = "https://judgeevaluationsystem.onrender.com/api/v1";
  // const BACKEND_URL = "http://localhost:5000/api/v1";

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

  // Pagination states
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

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

    const eventObj = events.find((e) => e._id === eventRef || e.id === eventRef);
    return eventObj ? eventObj.name : "Unknown Event";
  };

  const promptDelete = (contestant) => {
    setSelectedContestant(contestant);
    setShowModal(true);
  };

  const handleDelete = async () => {
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
    if (!file) return toast.error("Please select an Excel file!");
    if (!selectedEvent) return toast.error("Please select an event!");

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
        toast.success(`Bulk upload completed! Inserted: ${data.inserted || 0}`);
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

  //FETCH CONTESTANTS
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

          setContestants(Array.isArray(data.contestants) ? data.contestants : []);
          if (typeof data.event === "string") setJudgeEventName(data.event);
        } else {
          const contestantsRes = await fetch(`${BACKEND_URL}/contestants`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const contestantsData = await contestantsRes.json();
          setContestants(
            Array.isArray(contestantsData.contestants)
              ? contestantsData.contestants
              : []
          );

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

  //  Pagination Logic
  const pages = Math.ceil(contestants.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentContestants = contestants.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64 text-sm text-gray-600 animate-pulse">
        Loading contestants...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="mb-8 relative">
        <div className="pr-14 sm:pr-0">
          <h2 className="text-md sm:text-xl font-bold text-gray-800 flex items-center gap-3">
            <span className="w-1 h-8 bg-gradient-to-b from-green-500 to-green-700 rounded-full"></span>
            Available Contestants
          </h2>
          <p className="text-sm text-gray-500 mt-2 ml-4">
            {contestants.length} contestant
            {contestants.length !== 1 ? "s" : ""} found
          </p>
        </div>

        <button
          onClick={() => setShowUpload(!showUpload)}
          className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg hover:-translate-y-1 transition-all px-6 py-2.5 font-semibold"
        >
          <FontAwesomeIcon icon={faUpload} />
          <span className="ml-2 hidden sm:inline">
            {showUpload ? "Close Upload" : "Bulk Upload"}
          </span>
        </button>
      </div>

      {/* BULK UPLOAD */}
      {showUpload && (
        <div className="mb-8 p-6 border-2 border-green-200 rounded-2xl bg-white shadow-lg">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FontAwesomeIcon icon={faUpload} /> Bulk Upload Contestants
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-1">
                Select Event
              </label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full border-2 px-3 py-2 rounded-lg"
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
              <label className="block text-sm font-semibold mb-1">
                Upload File
              </label>
              <input
                type="file"
                accept=".csv, .xlsx"
                onChange={(e) => setFile(e.target.files[0])}
                className="w-full border-2 px-3 py-2 rounded-lg"
              />
            </div>

            <button
              onClick={handleBulkUpload}
              disabled={!file || !selectedEvent || uploading}
              className="px-5 py-2 rounded-lg text-white font-semibold bg-green-600 disabled:bg-gray-400"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      )}

      {/* GRID */}
      {currentContestants.length === 0 ? (
        <div className="text-center py-20 text-gray-500 text-lg">
          <FontAwesomeIcon icon={faUser} className="text-6xl mb-3" />
          <p>No contestants found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentContestants.map((c, index) => (
              <div
                key={c._id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all overflow-hidden"
              >
                <div className="relative h-56 bg-green-100">
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faUser} className="text-6xl" />
                    </div>
                  )}

                  <div className="absolute top-3 left-3 h-12 w-12 bg-green-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                    {c.contestant_number || c.number || "?"}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold">{c.name}</h3>

                  <p className="text-sm text-gray-600 mb-2">
                    {getEventName(c.event)}
                  </p>

                  {c.email && (
                    <p className="text-xs text-gray-600 flex gap-2">
                      <FontAwesomeIcon icon={faEnvelope} />
                      {c.email}
                    </p>
                  )}
                  {c.phone && (
                    <p className="text-xs text-gray-600 flex gap-2 mb-3">
                      <FontAwesomeIcon icon={faPhone} />
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
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg"
                      >
                        <FontAwesomeIcon icon={faEdit} /> Edit
                      </button>

                      <button
                        onClick={() => promptDelete(c)}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg"
                      >
                        <FontAwesomeIcon icon={faTrash} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* PAGINATION GRID */}
          <div className="mt-8 flex justify-center">
            <Pagination page={page} pages={pages} onPageChange={setPage} />
          </div>
        </>
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
