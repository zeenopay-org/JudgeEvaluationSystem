import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import AssignTitleModal from "./AssignTitleModal";
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
  const [showModal,setShowModal]= useState(false);
  const[selectedTitle, setSelectedTitle]=useState(null);
  const [currentTitle, setCurrentTitle] = useState(null);
  const [assignedContestants, setAssignedContestants] = useState({});

  const handleCreateClick = () => {
    navigate("/title/create");
  };

  const promptDelete= (title) =>{
    setSelectedTitle(title);
    setShowModal(true);
  }
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
      }
      finally{
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
      toast.error("This title is not linked to any event.");
      return;
    }
    setCurrentTitle(title);
    setAssignModalOpen(true);
  };

  return (
   <div className="p-4  sm:px-4 lg:px-6 relative">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">All Event Titles</h2>
  <button
          onClick={handleCreateClick}
          className="bg-green-600 text-white px-3 sm:px-3 py-1 sm:py-2 rounded-md shadow hover:bg-green-700 transition duration-200 text-xs sm:text-base w-auto flex items-center gap-1.5 sm:gap-2
                 sm:static absolute top-3 right-3"
        >
          <span className="text-base sm:text-lg font-bold">+</span>
          <span className="text-xs sm:text-base"> Create Title</span>
        </button>
  </div>
{loading ? (
  <p className="text-sm text-gray-600">Loading titles...</p>
) : Object.keys(groupedTitles).length === 0 ? (
  <p className="text-sm text-gray-500 italic">No titles found.</p>
) : (
  Object.entries(groupedTitles).map(([eventName, eventTitles]) => (
    <div key={eventName || "unknown-event"} className="mb-6">
      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 border-b border-gray-500 pb-1 flex items-center gap-2">
        <span className="text-blue-600">🏆</span>
        {eventName || "Unknown Event"}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {eventTitles.map((title) => {
          const safeTitleName = title?.name || "Untitled";
          const assigned = assignedContestants?.[title._id] || [];
             return (
            <div
              key={title?._id || Math.random()}
              className="bg-white rounded-md shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition"
            >
              {title?.image ? (
                <img
                  src={title.image}
                  alt={safeTitleName}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                  No Image
                </div>
              )}

              <div className="p-3">
                <h4 className="text-sm font-semibold text-gray-800 mb-1">
                  {safeTitleName}
                </h4>

                {assigned.length > 0 ? (
                  <div className="mb-2">
                    <p className="text-xs font-medium text-gray-600">
                      Assigned Contestants:
                    </p>
                    <ul className="list-disc list-inside text-xs text-gray-700">
                      {assigned.map((c, idx) => {
                        if (!c) {
                             return (
                            <li
                              key={idx}
                              className="italic text-gray-400"
                            >
                              [Deleted Contestant]
                            </li>
                          );
                        }
                        return (
                          <li key={c._id}>
                            {c.name || "Unnamed"} (#
                            {c.contestant_number || "N/A"})
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 italic">
                    No contestants assigned yet.
                  </p>
                )}

                <div className="flex justify-between items-center mt-3 gap-2">
                  <button
                    onClick={() => openAssignModal(title)}
                    className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 text-xs text-center"
                  >
                    Assign
                  </button>
                  <button
                    onClick={() => promptDelete(title)}
                    className="flex-1 bg-red-600 text-white px-3 py-1.5 rounded-md hover:bg-red-700 text-xs text-center"
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
