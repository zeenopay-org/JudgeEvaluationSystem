import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { toast } from "react-toastify";

const BACKEND_URL = "https://judgeevaluationsystem.onrender.com/api/v1";

const CreateTitleForm = ({ onSuccess }) => {
  const { token } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [titleName, setTitleName] = useState("");
  const [titleImage, setTitleImage] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch events for dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/events`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setEvents(data.events || data);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      }
    };
    fetchEvents();
  }, [token]);

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!titleName || !selectedEvent) {
      toast.error("Please enter title name and select an event.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", titleName);
      formData.append("eventId", selectedEvent);
      if (titleImage) formData.append("image", titleImage); // 👈 MUST match upload.single("image")

      const res = await fetch(`${BACKEND_URL}/titles/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // ✅ No "Content-Type" header
        },
        body: formData,
      });

      const data = await res.json();
      console.log("Response:", data);

      if (res.ok) {
        toast.success("Title created successfully!");
        setTitleName("");
        setTitleImage(null);
        setSelectedEvent("");
        onSuccess && onSuccess(data);
      } else {
        toast.error(data.message || "Failed to create title");
      }
    } catch (err) {
      console.error("Error creating title:", err);
      toast.error("Error creating title");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-6">🎀 Create New Title</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title Name
          </label>
          <input
            type="text"
            value={titleName}
            onChange={(e) => setTitleName(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            placeholder="e.g. Miss Popular"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setTitleImage(e.target.files[0])}
            className="w-full text-sm border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
          />
        </div>

        {/* Event Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Event
          </label>
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
            required
          >
            <option value="">-- Select Event --</option>
            {events.map((event) => (
              <option key={event._id} value={event._id}>
                {event.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className={`w-full bg-green-600 text-white font-medium py-2 px-4 rounded-md hover:bg-green-700 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Title"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTitleForm;
