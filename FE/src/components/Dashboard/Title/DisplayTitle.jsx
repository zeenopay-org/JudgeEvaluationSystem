import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const DisplayTitle = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [titles, setTitles] = useState([]);
  const [groupedTitles, setGroupedTitles] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleCreateClick = () => {
    navigate("/title/create");
  };

  const handleDelete = async (title) => {
    if (window.confirm(`Are you sure you want to delete ${title.name}?`)) {
      try {
        const res = await fetch(`http://localhost:5000/api/v1/titles/delete/${title._id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const updatedTitles = titles.filter((t) => t._id !== title._id);
          setTitles(updatedTitles);
          groupTitlesByEvent(updatedTitles);
          setSuccessMessage(`${title.name} deleted successfully!`);
        } else {
          console.error("Failed to delete title");
        }
      } catch (err) {
        console.error("Error deleting title:", err);
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
          navigate("/login");
          return;
        }

        const data = await res.json();
        const titleList = Array.isArray(data) ? data : data.titles || [];
        setTitles(titleList);
        groupTitlesByEvent(titleList);
      } catch (err) {
        console.error("Error fetching titles:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTitles();
  }, [token, navigate]);

  return (
    <div className="p-6">
      {successMessage && (
        <div className="mb-4 rounded border border-green-300 bg-green-50 text-green-800 px-4 py-2">
          {successMessage}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">All Event Titles</h2>
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
        Object.entries(groupedTitles).map(([eventName, titles]) => (
          <div key={eventName} className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-3 border-b pb-2 flex items-center gap-3">
              <span className="text-blue-600">🏆</span>
              {eventName}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {titles.map((title) => (
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
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">
                      {title.name}
                    </h4>
                    <div className="flex justify-between items-center mt-3 gap-4">
                      <button className="basis-2/3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm text-center">
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
    </div>
  );
};

export default DisplayTitle;