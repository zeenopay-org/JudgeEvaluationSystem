import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faStar,
  faTag,
  faCalendarDays,
  faQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import DeleteModal from "../../DeleteModal.jsx";

const BACKEND_URL = "https://judgeevaluationsystem.onrender.com/api/v1";
// const BACKEND_URL = "http://localhost:5000/api/v1";

const DisplayRound = () => {
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
    if (a.type === "qna" && b.type !== "qna") return 1;
    if (a.type !== "qna" && b.type === "qna") return -1;
    return 0;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 relative">
        <h2 className="text-md sm:text-xl font-bold text-gray-800 flex items-center gap-3 pr-14 sm:pr-0">
          <span className="w-1 h-8 rounded-full"></span>
          Available Rounds
        </h2>
        <button
          onClick={handleCreateClick}
          className="absolute top-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-2 font-semibold
          w-12 h-12 sm:w-auto sm:h-auto sm:px-6 sm:py-2.5 justify-center"
        >
          <span className="text-xl font-bold">+</span>
          <span className="hidden sm:inline">Create Round</span>
        </button>
      </div>

      {rounds.length === 0 ? (
        <div className="text-center text-gray-500 text-lg mt-20">
          No rounds available
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {sortedRounds.map((round, index) => (
            <div
              key={round._id || round.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group hover:-translate-y-2"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card Header with gradient */}
              <div className="h-2 bg-gradient-to-r from-green-400 to-green-600"></div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-800 mb-3 group-hover:text-green-600 transition-colors">
                  {round.name}
                </h3>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {round.type && (
                    <span className="inline-flex items-center bg-gradient-to-r from-green-50 to-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                      <FontAwesomeIcon
                        icon={faTag}
                        className="mr-1 text-yellow-500 text-xl"
                      />
                      {round.type}
                    </span>
                  )}
                  {typeof round.max_score !== "undefined" && (
                    <span className="inline-flex items-center bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                      <FontAwesomeIcon
                        icon={faStar}
                        className="mr-1 text-yellow-500 text-xl"
                      />
                      {round.max_score} pts
                    </span>
                  )}
                  {round.event && (
                    <span className="inline-flex items-center bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                      <FontAwesomeIcon
                        icon={faCalendarDays}
                        className="mr-1 text-blue-500 text-sm"
                      />
                      {typeof round.event === "object"
                        ? round.event.name || round.event._id
                        : round.event}
                    </span>
                  )}
                </div>

                {/* Questions */}
                {Array.isArray(round.questions) && round.questions.length > 0 && (
                  <div className="mt-4 bg-gradient-to-br from-gray-50 to-green-50 p-4 rounded-xl border-2 border-green-100">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <FontAwesomeIcon
                        icon={faQuestion}
                        className="text-red-500 text-sm"
                      />
                      Questions ({round.questions.length})
                    </h4>
                    <ul className="space-y-2 max-h-32 overflow-y-auto">
                      {round.questions.map((q) => (
                        <li
                          key={q._id}
                          className="text-sm text-gray-700 bg-white border border-green-100 rounded-lg px-3 py-2 shadow-sm hover:shadow-md transition-shadow"
                        >
                          {truncateByLetters(q.question_text, 30)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={() => handleEdit(round)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <FontAwesomeIcon icon={faEdit} />
                    Edit
                  </button>
                  <button
                    onClick={() => promptDelete(round)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <DeleteModal
        show={showModal}
        itemName={selectedRound?.name}
        onConfirm={handleDelete}
        onCancel={() => setShowModal(false)}
      />
    </div>
  );
};

export default DisplayRound;
