import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import DeleteModal from "../../DeleteModal.jsx";

const BACKEND_URL = "https://judgeevaluationsystem.onrender.com/api/v1";

const displayRound = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [rounds, setRounds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRound, setSelectedRound] = useState(null);
  const handleCreateClick = () => {
    navigate("/round/create");
  };

  const handleEdit = (round) => {
    navigate(`/round/edit/${round._id}`);
  };

  const promptDelete = (round) => {
    setSelectedRound(round);
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/rounds/delete/${selectedRound._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.ok) {
        setRounds((prev) => prev.filter((r) => r._id !== selectedRound._id));
        toast.success(`${selectedRound.name} deleted successfully!`);
      } else {
        toast.error("Failed to delete round");
      }
    } catch (err) {
      toast.error("Error deleting round");
      console.error(err);
    } finally {
      setShowModal(false);
      setSelectedRound(null);
    }
  };

  const truncateByLetters = (text, length) => {
    if (!text) return "";
    return text.length > length ? text.slice(0, length) + "..." : text;
  };
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchRounds = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/rounds`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (res.status === 401) {
          navigate("/login");
          return;
        }
        if (!res.ok) {
          toast.error("Failed to load rounds");
        }
        const data = await res.json();
        setRounds(data.rounds || data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchRounds();
  }, [token, navigate]);

  const sortedRounds = [...rounds].sort((a, b) => {
    if (a.type === "qna" && b.type !== "qna") return 1; // move a (qna) to end
    if (a.type !== "qna" && b.type === "qna") return -1; // keep non-qna first
    return 0; // keep original order otherwise
  });

  return (
    <div className="px-2 py-6 sm:px-4 lg:px-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
          Available Rounds
        </h2>
        <button
          onClick={handleCreateClick}
          className="bg-green-600 text-white px-3 sm:px-3 py-1 sm:py-2 rounded-md shadow hover:bg-green-700 transition duration-200 text-xs sm:text-base w-auto flex items-center gap-1.5 sm:gap-2
                 sm:static absolute top-3 right-3"
        >
          <span className="text-base sm:text-lg font-bold">+</span>
          <span className="text-xs sm:text-base">Create Round</span>
        </button>
      </div>

      {/* Grid of rounds */}
      <div className="grid gap-6 sm:gap-7 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {sortedRounds.map((round) => (
          <div
            key={round._id || round.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div className="p-4">
              <h3 className="text-sm sm:text-md font-semibold text-gray-800 mb-2">
                {round.name}
              </h3>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {round.type && (
                  <span className="inline-block bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                    Type: {round.type}
                  </span>
                )}
                {typeof round.max_score !== "undefined" && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                    Max Score: {round.max_score}
                  </span>
                )}
                {round.event && (
                  <span className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
                    Event:{" "}
                    {typeof round.event === "object"
                      ? round.event.name || round.event._id
                      : round.event}
                  </span>
                )}
              </div>

              {/* Questions */}
              {Array.isArray(round.questions) && round.questions.length > 0 && (
                <div className="mt-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Questions
                  </h4>
                  <ul className="space-y-2">
                    {round.questions.map((q) => (
                      <li
                        key={q._id}
                        className="text-xs sm:text-sm text-gray-600 bg-white border border-gray-100 rounded-md px-3 py-2 shadow-sm"
                      >
                        {truncateByLetters(q.question_text, 30)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleEdit(round)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors text-xs sm:text-sm shadow"
                >
                  <FontAwesomeIcon icon={faEdit} />
                  Edit
                </button>
                <button
                  onClick={() => promptDelete(round)}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors text-xs sm:text-sm shadow"
                >
                  <FontAwesomeIcon icon={faTrash} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        <DeleteModal
          show={showModal}
          itemName={selectedRound?.name}
          onConfirm={handleDelete}
          onCancel={() => setShowModal(false)}
        />
      </div>
    </div>
  );
};

export default displayRound;
