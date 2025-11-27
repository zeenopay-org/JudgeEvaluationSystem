import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AssignTitleModal from "./AssignTitleModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faTrophy,
  faCrown,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import DeleteModal from "../../DeleteModal";

import { toast } from "react-toastify";

const BACKEND_URL = "https://judgeevaluationsystem.onrender.com/api/v1";

const DisplayTitle = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [titles, setTitles] = useState([]);
  const [groupedTitles, setGroupedTitles] = useState({});
  const [loading, setLoading] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [currentTitle, setCurrentTitle] = useState(null);
  const [assignedContestants, setAssignedContestants] = useState({});

  const handleCreateClick = () => {
    navigate("/title/create");
  };

  const promptDelete = (title) => {
    setSelectedTitle(title);
    setShowModal(true);
  };

  const handleDelete = async (title) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/titles/delete/${selectedTitle._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        const updatedTitles = titles.filter((t) => t._id !== selectedTitle._id);
        setTitles(updatedTitles);
        groupTitlesByEvent(updatedTitles);
        toast.success(`${selectedTitle.name} deleted successfully!`);
      } else {
        toast.error("Failed to delete title.");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setShowModal(false);
      setSelectedTitle(null);
    }
  };

  const groupTitlesByEvent = (titlesArray) => {
    const grouped = titlesArray.reduce((acc, title) => {
      const eventName = title.event?.name || "Unknown Event";
      if (!acc[eventName]) acc[eventName] = [];
      acc[eventName].push(title);
      return acc;
    }, {});
    setGroupedTitles(grouped);
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchTitles = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/titles`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (res.status === 401) {
          toast.error("Session expired. Please log in again.");
          navigate("/login");
          return;
        }

        const data = await res.json();
        const titleList = Array.isArray(data) ? data : data.titles || [];
        setTitles(titleList);
        groupTitlesByEvent(titleList);
        fetchAssignments(titleList);
      } catch (err) {
        toast.error("Error fetching titles");
      } finally {
        setLoading(false);
      }
    };

    fetchTitles();
  }, [token, navigate]);

  const fetchAssignments = async (titlesList) => {
    const assignments = {};
    for (const title of titlesList) {
      try {
        const res = await fetch(`${BACKEND_URL}/titles/assigned/${title._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && Array.isArray(data.contestants)) {
          assignments[title._id] = data.contestants;
        } else {
          assignments[title._id] = [];
        }
      } catch (error) {
        assignments[title._id] = [];
      }
    }
    setAssignedContestants(assignments);
  };

  const openAssignModal = (title) => {
    if (!title?.event?._id) {
      toast.error("This title is not linked to any event.");
      return;
    }
    setCurrentTitle(title);
    setAssignModalOpen(true);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 relative">
        <h2 className="text-md sm:text-xl font-bold text-gray-800 flex items-center gap-3 pr-14 sm:pr-0">
          <span className="w-1 h-8 bg-gradient-to-b from-green-500 to-green-700 rounded-full"></span>
          Event Titles
        </h2>
        <button
          onClick={handleCreateClick}
          className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2 font-semibold
          w-12 h-12 sm:w-auto sm:h-auto sm:px-6 sm:py-2.5 justify-center"
        >
          <span className="text-md font-bold">+</span>
          <span className="hidden sm:inline">Create Title</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-gray-600 animate-pulse">Loading titles...</p>
        </div>
      ) : Object.keys(groupedTitles).length === 0 ? (
        <div className="text-center py-20">
          <FontAwesomeIcon
            icon={faTrophy}
            className="text-yellow-500 text-6xl mb-4 opacity-90"
          />

          <p className="text-gray-500 text-lg">No titles found</p>
        </div>
      ) : (
        Object.entries(groupedTitles).map(([eventName, eventTitles]) => (
          <div key={eventName || "unknown-event"} className="mb-10">
            {/* Event Header */}
            <div className="mb-6 pb-3 border-b-2 border-green-200">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                <FontAwesomeIcon
                  icon={faTrophy}
                  className="text-2xl text-yellow-500"
                />

                <span>{eventName || "Unknown Event"}</span>
                <span className="text-sm font-normal text-gray-500">
                  ({eventTitles.length}{" "}
                  {eventTitles.length === 1 ? "title" : "titles"})
                </span>
              </h3>
            </div>

            {/* Titles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {eventTitles.map((title, index) => {
                const safeTitleName = title?.name || "Untitled";
                const assigned = assignedContestants?.[title._id] || [];

                return (
                  <div
                    key={title?._id || Math.random()}
                    className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-2"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Title Image */}
                    <div className="relative">
                      {title?.image ? (
                        <img
                          src={title.image}
                          alt={safeTitleName}
                          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                          <FontAwesomeIcon
                            icon={faCrown}
                            className="text-7xl opacity-50 text-yellow-500"
                          />
                          );
                        </div>
                      )}

                      {/* Badge overlay */}
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        Title
                      </div>
                    </div>

                    {/* Title Content */}
                    <div className="p-5">
                      <h4 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-green-600 transition-colors">
                        {safeTitleName}
                      </h4>

                      {/* Assigned Contestants */}
                      {assigned.length > 0 ? (
                        <div className="mb-4 bg-gradient-to-br from-green-50 to-white p-3 rounded-xl border-2 border-green-100">
                          <p className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-green-500 text-sm"
                            />
                            Assigned ({assigned.length})
                          </p>
                          <ul className="space-y-1 max-h-24 overflow-y-auto">
                            {assigned.map((c, idx) => {
                              if (!c) {
                                return (
                                  <li
                                    key={idx}
                                    className="text-xs italic text-gray-400"
                                  >
                                    [Deleted Contestant]
                                  </li>
                                );
                              }
                              return (
                                <li
                                  key={c._id}
                                  className="text-xs text-gray-700 bg-white px-2 py-1 rounded-lg border border-green-100"
                                >
                                  <span className="font-semibold">
                                    {c.name || "Unnamed"}
                                  </span>
                                  <span className="text-gray-500">
                                    {" "}
                                    #{c.contestant_number || "N/A"}
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ) : (
                        <div className="mb-4 bg-gray-50 p-3 rounded-xl border-2 border-gray-100">
                          <p className="text-xs text-gray-500 italic flex items-center gap-1">
                            <FontAwesomeIcon
                              icon={faTriangleExclamation}
                              className="text-yellow-500"
                            />
                            No contestants assigned
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => openAssignModal(title)}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                          Assign
                        </button>
                        <button
                          onClick={() => promptDelete(title)}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 rounded-lg hover:from-red-600 hover:to-red-700 text-sm font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {assignModalOpen && currentTitle && (
        <AssignTitleModal
          key={currentTitle._id}
          titleId={currentTitle._id}
          eventId={currentTitle.event?._id}
          onClose={() => setAssignModalOpen(false)}
          onAssignSuccess={() => {
            setAssignModalOpen(false);
            fetchAssignments(titles);
          }}
        />
      )}

      <DeleteModal
        show={showModal}
        itemName={selectedTitle?.name}
        onConfirm={handleDelete}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
};

export default DisplayTitle;
