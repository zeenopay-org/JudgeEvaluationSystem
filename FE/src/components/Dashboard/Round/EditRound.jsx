import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/AuthContext";
import { toast } from "react-toastify";

const BACKEND_URL = "http://localhost:5000/api/v1"; 

const EditRound = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [eventId, setEventId] = useState("");
  const [questions, setQuestions] = useState([""]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Fetch round details by ID
  useEffect(() => {
    if (!id) return;

    const fetchRound = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/rounds/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch round");

        const data = await res.json();

        const round = data.round;

        setName(round.name || "");
        setType(round.type || "");
        setMaxScore(round.max_score || "");
        setEventId(round.event || ""); // important key
        setQuestions(round.questions?.length ? round.questions : [""]);
      } catch (err) {
        console.error("Error fetching round:", err);
        toast.error("Failed to fetch round details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRound();
  }, [id, token]);

  // Fetch all events
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoadingEvents(true);
      try {
        const res = await fetch(`${BACKEND_URL}/events/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch events");

        const data = await res.json();
        setEvents(data.events || data);
      } catch (err) {
        toast.error("Failed to fetch events.");
      } finally {
        setIsLoadingEvents(false);
      }
    };
    fetchEvents();
  }, [token]);

  // Questions handlers
  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index] = value;
    setQuestions(updated);
  };
  const addQuestion = () => setQuestions([...questions, ""]);
  const removeQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated.length ? updated : [""]);
  };

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      name,
      type,
      max_score: maxScore,
      questions,
      event: eventId,
    };

    try {
      const res = await fetch(
        `${BACKEND_URL}/rounds/edit/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("Round updated successfully");
        navigate("/round");
      } else {
        toast.error(data.message || "Failed to update round");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error. Check server.");
    } finally {
      setIsLoading(false);
    }
  };

  // Render
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <h1 className="text-xl font-bold mb-4">Edit Round</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Round Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Round Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-sm  px-4 py-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full text-sm  px-4 py-3 border border-gray-300 rounded-lg bg-white"
              required
            >
              <option value="">Select round type</option>
              <option value="normal">normal</option>
              <option value="qna">qna</option>
            </select>
          </div>

          {/* Questions if qna */}
          {type === "qna" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Questions
              </label>
              {questions.map((q, i) => (
                <div key={i} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => handleQuestionChange(i, e.target.value)}
                    className="flex-grow  text-sm  px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => removeQuestion(i)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addQuestion}
                className="mt-2 px-4 py-1  bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Add Question
              </button>
            </div>
          )}

          {/* Max Score */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Score
            </label>
            <input
              type="number"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              className="w-full  text-sm  px-4 py-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          {/* Event Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Event
            </label>
            <select
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full  text-sm  px-4 py-3 border border-gray-300 rounded-lg bg-white"
              required
              disabled={isLoadingEvents}
            >
              <option value="">
                {isLoadingEvents ? "Loading events..." : "Select an event"}
              </option>
              {events.map((event) => (
                <option key={event._id} value={event._id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-3 px-6 rounded-lg text-white ${
              isLoading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isLoading ? "Updating..." : "Update Round"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditRound;
