import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import useJobsApi from "../api/jobs";
import Modal from "../templates/Modal";

const fakeData = [
  {
    slug: "todo",
    label: "To Do",
    applications: [
      { id: 1, applicant: { name: "John Doe", email: "john@example.com" } },
      { id: 2, applicant: { name: "Jane Smith", email: "jane@example.com" } },
    ],
  },
  {
    slug: "in-progress",
    label: "In Progress",
    applications: [
      { id: 3, applicant: { name: "Mike Johnson", email: "mike@example.com" } },
    ],
  },
  {
    slug: "done",
    label: "Done",
    applications: [],
  },
];

const Kanban = () => {
  const { id } = useParams();
  const { getKanbanData } = useJobsApi();
  const [columns, setColumns] = useState(fakeData);
  const [modal, setModal] = useState({
    isOpen: false,
    appId: null,
    fromSlug: "",
    direction: "",
  });

  const fetchKanban = useCallback(async () => {
    try {
      const data = await getKanbanData(id);
      setColumns(data.columns || []);
    } catch (error) {
      console.error("Error fetching Kanban data:", error);
    }
  }, [id, getKanbanData]);

  useEffect(() => {
    if (id) fetchKanban();
  }, [id, fetchKanban]);

  // Move application between stages
  const moveApplication = async () => {
    const { appId, fromSlug, direction } = modal;

    setColumns((prevColumns) => {
      const columnIndex = prevColumns.findIndex((col) => col.slug === fromSlug);
      if (columnIndex === -1) return prevColumns;

      const targetIndex =
        direction === "forward" ? columnIndex + 1 : columnIndex - 1;
      if (targetIndex < 0 || targetIndex >= prevColumns.length)
        return prevColumns;

      const nextStatus = prevColumns[targetIndex].slug; // Get next stage
      const apiUrl = `https://api.talentengine.tech/jobs/applications/${appId}/status?status=${nextStatus}`;

      // Send API request
      fetch(apiUrl, {
        method: "PATCH",
        headers: { Accept: "application/json" },
      })
        .then((response) => {
          if (!response.ok) throw new Error("Failed to update status");

          // Move application on success
          const fromColumn = { ...prevColumns[columnIndex] };
          const toColumn = { ...prevColumns[targetIndex] };

          const appIndex = fromColumn.applications.findIndex(
            (app) => app.id === appId
          );
          if (appIndex === -1) return prevColumns;

          const [app] = fromColumn.applications.splice(appIndex, 1);
          toColumn.applications.push(app);

          const updatedColumns = [...prevColumns];
          updatedColumns[columnIndex] = fromColumn;
          updatedColumns[targetIndex] = toColumn;

          setColumns(updatedColumns);
        })
        .catch((error) => console.error("Error moving application:", error));

      return prevColumns;
    });

    setModal({ isOpen: false, appId: null, fromSlug: "", direction: "" });
  };

  // Open the confirmation modal
  const handleMove = (appId, fromSlug, direction) => {
    setModal({
      isOpen: true,
      appId,
      fromSlug,
      direction,
    });
  };

  return (
    <div className="flex overflow-x-auto space-x-4 p-4 bg-gray-100 h-screen">
      {columns.map((column, index) => (
        <div
          key={column.slug}
          className="w-64 bg-white shadow-lg rounded-lg p-4"
        >
          <h3 className="text-lg font-semibold mb-3">{column.label}</h3>
          <div className="space-y-3">
            {column.applications.length > 0 ? (
              column.applications.map((app) => (
                <div
                  key={app.id}
                  className="bg-blue-100 p-3 rounded-lg shadow-md"
                >
                  <p className="font-medium">
                    {app.applicant?.name || "Unnamed Applicant"}
                  </p>
                  <small className="text-gray-600">
                    {app.applicant?.email || "No Email"}
                  </small>
                  <div className="flex justify-between mt-2">
                    {index > 0 && (
                      <button
                        onClick={() =>
                          handleMove(app.id, column.slug, "backward")
                        }
                        className="bg-gray-300 px-2 py-1 rounded text-sm"
                      >
                        ← Back
                      </button>
                    )}
                    {index < columns.length - 1 && (
                      <button
                        onClick={() =>
                          handleMove(app.id, column.slug, "forward")
                        }
                        className="bg-green-500 text-white px-2 py-1 rounded text-sm"
                      >
                        Next →
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No applications</p>
            )}
          </div>
        </div>
      ))}

      {/* Confirmation Modal */}
      <Modal
        isOpen={modal.isOpen}
        title="Confirm Move"
        message="Are you sure you want to move this application?"
        onConfirm={moveApplication}
        onCancel={() =>
          setModal({ isOpen: false, appId: null, fromSlug: "", direction: "" })
        }
      />
    </div>
  );
};

export default Kanban;
