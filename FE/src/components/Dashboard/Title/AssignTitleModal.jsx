import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { toast } from "react-toastify";

const AssignTitleModal = ({ titleId, eventId, onClose, onAssignSuccess }) => {
  const { token } = useContext(AuthContext);
  const [contestants, setContestants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ Fetch contestants for the given event
  useEffect(() => {
    const fetchContestants = async () => {
      if (!eventId) {
        console.error("❌ Missing eventId");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/v1/contestants/event/${eventId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();

        if (res.ok && Array.isArray(data.contestants)) {
          setContestants(data.contestants);
        } else {
          console.error("Unexpected response:", data);
          setContestants([]);
        }
      } catch (err) {
        console.error("Failed to fetch contestants:", err);
        setContestants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContestants();
  }, [eventId, token]);

  //  Assign title to a contestant

  const handleAssign = async (contestantId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/v1/titleassignment/assign-title`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ titleId, contestantId }),
        }
      );

      const data = await res.json();

      if (res.status === 409) {
        toast.error(data.message || "This title is already assigned.");
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to assign title.");
      }

      toast.success("Title Assigned Successfully!");
      onAssignSuccess && onAssignSuccess();
    } catch (err) {
      console.error("Assignment error:", err);
      toast.error(err.message || "Error assigning title");
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-40 flex justify-center items-start pt-16 z-50">
      <div className="mt-24 bg-white rounded-lg shadow-lg w-11/12 max-w-3xl p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-xl font-bold"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold mb-4 text-center">
          Assign Title to Contestant
        </h2>

        {message && (
          <p className="mb-4 text-center text-green-600">{message}</p>
        )}

        {/* ✅ Show loading or contestant grid */}
        {loading ? (
          <p className="text-center">Loading contestants...</p>
        ) : Array.isArray(contestants) && contestants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
            {contestants.map((c) => (
              <div
                key={c._id}
                className="bg-gray-50 rounded-lg shadow hover:shadow-md p-4 flex flex-col items-center text-center transition"
              >
                <img
                  src={c.photo || "https://via.placeholder.com/100"}
                  alt={c.name}
                  className="w-24 h-24 text-md rounded-full object-cover mb-2 border-2 border-gray-200"
                />
                <h3 className="font-semibold  text-sm  text-gray-800">{c.name}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  #{c.contestant_number}
                </p>
                <button
                  onClick={() => handleAssign(c._id)}
                  className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
                >
                  Assign
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 italic">
            No contestants found for this event.
          </p>
        )}
      </div>
    </div>
  );
};

export default AssignTitleModal;
