import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { toast } from "react-toastify";

// const BACKEND_URL = "http://localhost:5000/api/v1";
const BACKEND_URL = "https://judgeevaluationsystem.onrender.com/api/v1";

const TitleWinner = () => {
  const { token } = useContext(AuthContext)
  const [winners, setWinners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchWinners = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/titleassignment/winner`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch winners");

        const data = await res.json();
        setWinners(data.winners || []);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load winners");
      } finally {
        setIsLoading(false);
      }
    };

    fetchWinners();
  }, [token]);

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50">
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 shadow-sm border-collapse">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="py-3 px-4 text-left">Title</th>
              <th className="py-3 px-4 text-left">Contestants</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={2} className="text-center py-4">
                  Loading winners...
                </td>
              </tr>
            ) : winners.length === 0 ? (
              <tr>
                <td colSpan={2} className="text-center py-4 text-gray-500">
                  No winners found
                </td>
              </tr>
            ) : (
              winners.map((title, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="py-3 px-4 font-semibold">{title.titleName}</td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      {title.contestants.map((c, i) => (
                        <div
                          key={i}
                          className="flex justify-between bg-gray-50 px-3 py-1 rounded"
                        >
                          <span className="font-medium text-gray-700">
                            {c.contestantName}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {c.contestantNumber}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TitleWinner;
