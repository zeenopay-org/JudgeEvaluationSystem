import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const createRound = () => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [max_score, setMaxScore] = useState("");
  const [eventId, setEventId] = useState("");
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [visible, setVisible] = useState(false);
  const [questions, setQuestions] = useState([""]);

  const BACKEND_URL = "https://judgeevaluationsystem.onrender.com/api/v1"; 

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const response = await fetch(`${BACKEND_URL}/events`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        toast.error("Failed to fetch events");
      }

      const data = await response.json();
      setEvents(data.events || data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events. Please refresh the page.");
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleQuestionChange = (index, value) => {
    const updated = [...questions];
    updated[index] = value;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([...questions, ""]);
  };

  const removeQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(
        `${BACKEND_URL}/rounds/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            name,
            type,
            max_score,
            eventId,
            questions:
              type === "qna" ? questions.filter((q) => q.trim() !== "") : [],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create round");
      }

      const data = await response.json();
      toast.success("Round created successfully!");

      // Reset form
      setName("");
      setType("");
      setMaxScore("");
      setEventId("");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-xl font-bold text-gray-900">Create New Round</h1>
          <p className="text-gray-600  text-sm  mt-2">
            Add a new round to the evaluation system
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label
              htmlFor="round-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Round Name
            </label>
            <input
              type="text"
              id="round-name"
              name="round-name"
              placeholder="Enter round name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full  text-sm  px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
            />
          </div>

          {/* Type Field */}
          <div>
            <label
              htmlFor="type"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Type
            </label>
            <select
              id="type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full  text-sm  px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white"
              required
            >
              <option value="">Select round type</option>
              <option value="normal">normal</option>
              <option value="qna">qna</option>
            </select>

            {type === "qna" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Questions
                </label>
                {questions.map((question, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="text"
                      placeholder={`Question ${index + 1}`}
                      value={question}
                      onChange={(e) =>
                        handleQuestionChange(index, e.target.value)
                      }
                      className="flex-grow  text-sm px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addQuestion}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Question
                </button>
              </div>
            )}
          </div>

          {/* Max_score Field*/}
          <div className="relative">
            <label
              htmlFor="max_score"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Max Score
            </label>
            <div className="relative">
              <input
                id="max_score"
                type={visible ? "text" : "number"}
                placeholder="Enter max score"
                value={max_score}
                onChange={(e) => setMaxScore(e.target.value)}
                className="w-full  text-sm  max-w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                required
              />
            </div>
          </div>

          {/* Event_id Field */}
          <div>
            {/* <label htmlFor="eventId" className="block text-sm font-medium text-gray-700 mb-2">
              Event ID
            </label> */}
            <input
              type="hidden"
              id="eventId"
              name="eventId"
              placeholder="Enter event id"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="w-full  text-sm  px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              required
            />
          </div>

          {/* Event Selection Dropdown */}
          <div>
            <label
              htmlFor="eventId"
              className="block font-medium text-gray-700 mb-2"
            >
              Select Event
            </label>
            <div className="relative">
              <select
                id="eventId"
                name="eventId"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full  text-sm  px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 appearance-none bg-white"
                required
                disabled={isLoadingEvents}
              >
                <option value="">
                  {isLoadingEvents
                    ? "Loading events..."
                    : "Select an event to assign round"}
                </option>
                {events.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
            {isLoadingEvents && (
              <p className="mt-2 text-sm text-gray-500">Loading events...</p>
            )}
            {events.length === 0 && !isLoadingEvents && (
              <p className="mt-2 text-sm text-amber-600">
                No events available. Please create an event first.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition duration-200 ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              }`}
            >
              {isLoading ? "Creating Round..." : "Create Round"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default createRound;
