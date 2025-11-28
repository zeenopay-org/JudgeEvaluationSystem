import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import { toast } from "react-toastify";

const TitleWinner = () => {
  const { token } = useContext(AuthContext);
  const [winners, setWinners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchWinners = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `http://localhost:5000/api/v1/titleassignment/winner`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

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
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b bg-green-600 text-white">
          <h2 className="text-lg font-bold">Title Winners</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                  Title
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">
                  Contestants
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={2} className="text-center py-6">
                    <div className="flex justify-center items-center gap-2 text-gray-500">
                      <svg
                        className="animate-spin h-5 w-5 text-green-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8H4z"
                        ></path>
                      </svg>
                      Loading winners...
                    </div>
                  </td>
                </tr>
              ) : winners.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="text-center py-6 text-gray-500 italic"
                  >
                    No winners found
                  </td>
                </tr>
              ) : (
                winners.map((title, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="py-3 px-4  text-gray-800">
                      {title.titleName}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-2">
                        {title.contestants.map((c, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-md"
                          >
                            <span className="font-medium text-gray-700">
                              {c.contestantName}
                            </span>
                            <span className="text-xs font-semibold bg-green-600 text-white px-2 py-1 rounded-full">
                              #{c.contestantNumber}
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
    </div>
  );
};

export default TitleWinner;