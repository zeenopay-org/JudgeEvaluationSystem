import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AssignTitleModal from "./AssignTitleModal";
import { toast } from "react-toastify";

const DisplayTitle = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [titles, setTitles] = useState([]);
  const [groupedTitles, setGroupedTitles] = useState({});
  const [loading, setLoading] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [currentTitle, setCurrentTitle] = useState(null);
  const [assignedContestants, setAssignedContestants] = useState({});

  const handleCreateClick = () => {
    navigate("/title/create");
  };

  const handleDelete = async (title) => {
    if (window.confirm(`Are you sure you want to delete ${title.name}?`)) {
      try {
        const res = await fetch(
          `http://localhost:5000/api/v1/titles/delete/${title._id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          const updatedTitles = titles.filter((t) => t._id !== title._id);
          setTitles(updatedTitles);
          groupTitlesByEvent(updatedTitles);
          toast.success(`${title.name} deleted successfully!`);
        } else {
          toast.error("Failed to delete title.");
        }
      } catch (err) {
        toast.error("Something went wrong. Please try again.");
      }
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
        const res = await fetch("http://localhost:5000/api/v1/titles", {
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
        fetchAssignments(titleList); // ✅ Fetch assigned contestants
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
        const res = await fetch(
          `http://localhost:5000/api/v1/titles/assigned/${title._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
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
      alert("This title is not linked to any event.");
      return;
    }
    setCurrentTitle(title);
    setAssignModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">All Event Titles</h2>
        <button
          onClick={handleCreateClick}
          className="bg-green-600 text-white px-4 py-2 rounded-md shadow hover:bg-green-700 transition"
        >
          + Create Title
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading titles...</p>
      ) : Object.keys(groupedTitles).length === 0 ? (
        <p className="text-gray-500 italic">No titles found.</p>
      ) : (
        Object.entries(groupedTitles).map(([eventName, eventTitles]) => (
          <div key={eventName} className="mb-8 ">
            <h3 className="text-md font-bold text-gray-900 mb-3 border-b pb-2 flex items-center gap-3">
              <span className="text-blue-600">🏆</span>
              {eventName}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventTitles.map((title) => (
                <div
                  key={title._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition"
                >
                  {title.image && (
                    <img
                      src={title.image}
                      alt={title.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">
                      {title.name}
                    </h4>

                    {/*  Assigned Contestants */}
                    {assignedContestants[title._id]?.length > 0 ? (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-600">
                          Assigned Contestants:
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-700">
                          {assignedContestants[title._id].map((c) => (
                            <li key={c._id}>
                              {c.name} (#{c.contestant_number})
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic">
                        No contestants assigned yet.
                      </p>
                    )}

                    <div className="flex justify-between items-center mt-3 gap-4">
                      <button
                        onClick={() => openAssignModal(title)}
                        className="basis-2/3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm text-center"
                      >
                        Assign to Contestant
                      </button>
                      <button
                        onClick={() => handleDelete(title)}
                        className="basis-1/3 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm text-center"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
    </div>
  );
};

export default DisplayTitle;
