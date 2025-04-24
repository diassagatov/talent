import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useJobsApi from "../api/jobs";
import useApplicantsApi from "../api/applicants";
import { Link } from "react-router-dom";

const Kanban = () => {
  const { id } = useParams();
  const { getKanbanData, updateApplicationStatus } = useJobsApi();
  const { getApplicationById } = useApplicantsApi();
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [applicationDetails, setApplicationDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const fetchKanbanData = async () => {
      try {
        const data = await getKanbanData(id);
        // Extract columns from the response
        setColumns(data?.columns || []);
      } catch (error) {
        console.error("Error fetching kanban data:", error);
        setColumns([]);
      }
    };
    fetchKanbanData();
  }, [id]);

  // Handle drag start
  const handleDragStart = (e, applicationId) => {
    e.dataTransfer.setData("applicationId", applicationId);
    // Add visual feedback for dragged item
    e.target.classList.add("dragging");
  };

  // Handle drag end
  const handleDragEnd = (e) => {
    e.target.classList.remove("dragging");
  };

  // Handle drop event
  const handleDrop = async (e, targetColumnSlug) => {
    e.preventDefault();
    const applicationId = e.dataTransfer.getData("applicationId");

    // Don't proceed if we couldn't get the application ID
    if (!applicationId) return;

    // Find the application and its current column
    let sourceColumnSlug = null;
    let appToMove = null;

    for (const column of columns) {
      const app = column.applications.find(
        (app) => app.id.toString() === applicationId
      );
      if (app) {
        sourceColumnSlug = column.slug;
        appToMove = app;
        break;
      }
    }

    // Don't proceed if the application is already in the target column
    if (sourceColumnSlug === targetColumnSlug || !appToMove) return;

    try {
      setLoading(true);

      // Call the API to update the status
      await updateApplicationStatus(applicationId, targetColumnSlug);

      // Update the local state after successful API call
      const updatedColumns = columns.map((column) => {
        // Remove the application from its source column
        if (column.slug === sourceColumnSlug) {
          return {
            ...column,
            applications: column.applications.filter(
              (app) => app.id.toString() !== applicationId
            ),
          };
        }

        // Add the application to the target column
        if (column.slug === targetColumnSlug) {
          return {
            ...column,
            applications: [...column.applications, appToMove],
          };
        }

        return column;
      });

      setColumns(updatedColumns);
    } catch (error) {
      console.error("Error updating application status:", error);
      // You could add a toast notification here for error feedback
    } finally {
      setLoading(false);
    }
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("dragover");
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove("dragover");
  };

  // Get column color based on slug
  const getColumnColor = (slug) => {
    const colors = {
      new: "#3498db",
      screening: "#9b59b6",
      interview: "#1abc9c",
      offer: "#2ecc71",
      rejected: "#e74c3c",
      hired: "#f1c40f",
      default: "#34495e",
    };
    return colors[slug] || colors.default;
  };

  // Get contrasting text color based on background
  const getContrastColor = (hexColor) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black or white based on luminance
    return luminance > 0.5 ? "#000000" : "#ffffff";
  };

  // Get secondary color (lighter version) for backgrounds
  const getLighterColor = (hexColor, opacity = 0.15) => {
    return `${hexColor}${Math.round(opacity * 255)
      .toString(16)
      .padStart(2, "0")}`;
  };

  // Handle application card click
  const handleApplicationClick = async (applicationId) => {
    try {
      setLoadingDetails(true);
      setSelectedApplication(applicationId);
      setModalOpen(true);

      const details = await getApplicationById(applicationId);
      setApplicationDetails(details);
    } catch (error) {
      console.error("Error fetching application details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setSelectedApplication(null);
    setApplicationDetails(null);
  };

  return (
    <div className="kanban-container" style={{ padding: "20px 0" }}>
      {loading && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "10px 20px",
            borderRadius: "5px",
            zIndex: 1000,
          }}
        >
          Updating...
        </div>
      )}
      <div
        className="kanban-board"
        style={{
          display: "flex",
          overflowX: "auto",
          padding: "10px",
          gap: "15px",
          minHeight: "calc(100vh - 200px)",
        }}
      >
        {columns.map((column) => {
          const columnColor = getColumnColor(column.slug);
          return (
            <div
              key={column.slug}
              className="kanban-column"
              style={{
                minWidth: "280px",
                width: "280px",
                background: "#f8f9fa",
                borderRadius: "8px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                maxHeight: "100%",
                overflow: "hidden",
                border: "1px solid #e9ecef",
              }}
              onDrop={(e) => handleDrop(e, column.slug)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div
                style={{
                  background: columnColor,
                  color: getContrastColor(columnColor),
                  padding: "12px 15px",
                  borderTopLeftRadius: "7px",
                  borderTopRightRadius: "7px",
                  fontWeight: "600",
                  fontSize: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <h3 style={{ margin: 0 }}>{column.label}</h3>
                <span
                  style={{
                    background: "rgba(255,255,255,0.3)",
                    borderRadius: "12px",
                    padding: "2px 8px",
                    fontSize: "12px",
                  }}
                >
                  {column.applications.length}
                </span>
              </div>
              <div
                style={{
                  padding: "10px",
                  overflowY: "auto",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  background: getLighterColor(columnColor, 0.05),
                }}
              >
                {column.applications.map((application) => (
                  <div
                    key={application.id}
                    className="kanban-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, application.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => handleApplicationClick(application.id)}
                    style={{
                      background: "white",
                      padding: "15px",
                      borderRadius: "6px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      cursor: "grab",
                      transition: "all 0.2s ease",
                      border: "1px solid #eaedf0",
                      borderLeft: `4px solid ${columnColor}`,
                    }}
                  >
                    <div
                      style={{
                        fontWeight: "500",
                        marginBottom: "5px",
                        fontSize: "14px",
                        color: columnColor,
                      }}
                    >
                      {application.applicant.first_name}{" "}
                      {application.applicant.last_name}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6c757d",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          background: columnColor,
                          opacity: 0.6,
                        }}
                      ></span>
                      {application.applicant.email}
                    </div>
                  </div>
                ))}
                {column.applications.length === 0 && (
                  <div
                    style={{
                      color: "#adb5bd",
                      padding: "20px 0",
                      textAlign: "center",
                      fontSize: "14px",
                      fontStyle: "italic",
                      border: `2px dashed ${columnColor}`,
                      borderRadius: "6px",
                      margin: "10px 0",
                      background: "white",
                    }}
                  >
                    No applications
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Application Details Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "white",
              padding: "20px",
              borderRadius: "8px",
              boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
              width: "90%",
              maxWidth: "700px",
              maxHeight: "80vh",
              overflow: "auto",
              zIndex: 1001,
            }}
          >
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
              }}
            >
              &times;
            </button>

            <h2>Application Details</h2>

            {loadingDetails ? (
              <div style={{ textAlign: "center", padding: "20px" }}>
                Loading application details...
              </div>
            ) : applicationDetails ? (
              <div className="application-details">
                <div className="detail-section">
                  <h3
                    style={{ color: getColumnColor(applicationDetails.status) }}
                  >
                    Applicant Information
                  </h3>
                  <div className="detail-grid">
                    <div>
                      <p>
                        <strong>Name:</strong>{" "}
                        {applicationDetails.applicant.first_name}{" "}
                        {applicationDetails.applicant.last_name}
                      </p>
                      <p>
                        <strong>Email:</strong>{" "}
                        {applicationDetails.applicant.email}
                      </p>
                      {applicationDetails.applicant.phone && (
                        <p>
                          <strong>Phone:</strong>{" "}
                          {applicationDetails.applicant.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <p>
                        <strong>Role:</strong>{" "}
                        {applicationDetails.applicant.role}
                      </p>
                      <p>
                        <strong>Applicant ID:</strong>{" "}
                        {applicationDetails.applicant.id}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="detail-section">
                  <h3
                    style={{ color: getColumnColor(applicationDetails.status) }}
                  >
                    Application Status
                  </h3>
                  <div className="detail-grid">
                    <div>
                      <p>
                        <strong>Current Status:</strong>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "3px 8px",
                            background: getLighterColor(
                              getColumnColor(applicationDetails.status),
                              0.2
                            ),
                            color: getColumnColor(applicationDetails.status),
                            borderRadius: "4px",
                            fontWeight: "500",
                            marginLeft: "5px",
                          }}
                        >
                          {applicationDetails.status_label ||
                            applicationDetails.status}
                        </span>
                      </p>
                      <p>
                        <strong>Applied:</strong>{" "}
                        {new Date(
                          applicationDetails.created_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Application ID:</strong> {applicationDetails.id}
                      </p>
                      <p>
                        <strong>Vacancy ID:</strong>{" "}
                        {applicationDetails.vacancy_id}
                      </p>
                    </div>
                  </div>
                </div>

                {applicationDetails.cv_file && (
                  <div className="detail-section">
                    <h3
                      style={{
                        color: getColumnColor(applicationDetails.status),
                      }}
                    >
                      Resume
                    </h3>
                    <div className="file-card">
                      <div className="file-info">
                        <div className="file-icon">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            width="24"
                            height="24"
                          >
                            <path d="M7 3H17C18.1046 3 19 3.89543 19 5V19C19 20.1046 18.1046 21 17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3ZM7 5V19H17V5H7ZM9 7H15V9H9V7ZM9 11H15V13H9V11ZM9 15H13V17H9V15Z" />
                          </svg>
                        </div>
                        <div>
                          <p className="file-name">
                            {applicationDetails.cv_file.original_filename}
                          </p>
                          <p className="file-size">
                            {(applicationDetails.cv_file.size / 1024).toFixed(
                              2
                            )}{" "}
                            KB • {applicationDetails.cv_file.mime_type}
                          </p>
                        </div>
                      </div>
                      <a
                        href={applicationDetails.cv_file.storage_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="file-download-btn"
                      >
                        View
                      </a>
                    </div>
                  </div>
                )}


{
                <Link to={`/in/interview/see/${applicationDetails.id}`}>
                  See response
                </Link>
}
                {applicationDetails.resume_evaluation && (
                  <div className="detail-section">
                    <h3
                      style={{
                        color: getColumnColor(applicationDetails.status),
                      }}
                    >
                      Resume Evaluation
                    </h3>
                    <div className="evaluation-card">
                      <div className="score-container">
                        <div
                          className="score-circle"
                          style={{
                            background: `conic-gradient(${getColumnColor(
                              applicationDetails.status
                            )} ${
                              applicationDetails.resume_evaluation.final_score *
                              100 *
                              3.6
                            }deg, #f0f0f0 0deg)`,
                          }}
                        >
                          <div className="score-inner">
                            <span>
                              {applicationDetails.resume_evaluation
                                .final_score * 100}
                              %
                            </span>
                          </div>
                        </div>
                        <div className="score-label">Final Score</div>
                      </div>

                      <div className="evaluation-details">
                        <h4>Category Scores</h4>
                        <div className="score-bars">
                          {Object.entries(
                            applicationDetails.resume_evaluation.category_scores
                          ).map(([category, score]) => (
                            <div key={category} className="score-bar-item">
                              <div className="score-bar-label">
                                <span>
                                  {category.replace(/([A-Z])/g, " $1").trim()}
                                </span>
                                <span>{score * 10}%</span>
                              </div>
                              <div className="score-bar-bg">
                                <div
                                  className="score-bar-fill"
                                  style={{
                                    width: `${score * 10}%`,
                                    backgroundColor: getColumnColor(
                                      applicationDetails.status
                                    ),
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <h4>Justification</h4>
                        <div className="justification">
                          {applicationDetails.resume_evaluation.justification}
                        </div>

                        <div className="eval-meta">
                          <span>
                            Model used:{" "}
                            {
                              applicationDetails.resume_evaluation
                                .llm_model_used
                            }
                          </span>
                          <span>
                            Evaluated on:{" "}
                            {new Date(
                              applicationDetails.resume_evaluation.evaluated_at
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {applicationDetails.interview_evaluation && (
                  <div className="detail-section">
                    <h3
                      style={{
                        color: getColumnColor(applicationDetails.status),
                      }}
                    >
                      Interview Evaluation
                    </h3>
                    <div className="evaluation-card">
                      <div className="score-container">
                        <div
                          className="score-circle"
                          style={{
                            background: `conic-gradient(${getColumnColor(
                              applicationDetails.status
                            )} ${
                              applicationDetails.interview_evaluation
                                .final_score *
                              100 *
                              3.6
                            }deg, #f0f0f0 0deg)`,
                          }}
                        >
                          <div className="score-inner">
                            <span>
                              {applicationDetails.interview_evaluation
                                .final_score * 100}
                              %
                            </span>
                          </div>
                        </div>
                        <div className="score-label">Final Score</div>
                      </div>

                      <div className="evaluation-details">
                        <h4>Category Scores</h4>
                        <div className="score-bars">
                          {Object.entries(
                            applicationDetails.interview_evaluation
                              .category_scores
                          ).map(([category, score]) => (
                            <div key={category} className="score-bar-item">
                              <div className="score-bar-label">
                                <span>
                                  {category.replace(/([A-Z])/g, " $1").trim()}
                                </span>
                                <span>{score * 10}%</span>
                              </div>
                              <div className="score-bar-bg">
                                <div
                                  className="score-bar-fill"
                                  style={{
                                    width: `${score * 10}%`,
                                    backgroundColor: getColumnColor(
                                      applicationDetails.status
                                    ),
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <h4>Question Feedback</h4>
                        <div className="question-feedback">
                          {Object.entries(
                            applicationDetails.interview_evaluation
                              .question_feedback
                          ).map(([question, feedback], index) => (
                            <div key={index} className="feedback-item">
                              <div className="feedback-question">
                                {question.replace(/([A-Z])/g, " $1").trim()}
                              </div>
                              <div className="feedback-answer">{feedback}</div>
                            </div>
                          ))}
                        </div>

                        <h4>Justification</h4>
                        <div className="justification">
                          {
                            applicationDetails.interview_evaluation
                              .justification
                          }
                        </div>

                        <div className="eval-meta">
                          <span>
                            Model used:{" "}
                            {
                              applicationDetails.interview_evaluation
                                .llm_model_used
                            }
                          </span>
                          <span>
                            Evaluated on:{" "}
                            {new Date(
                              applicationDetails.interview_evaluation.evaluated_at
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "20px" }}>
                Unable to load application details
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .kanban-column.dragover {
          background: #e9ecef;
        }
        .kanban-card.dragging {
          opacity: 0.6;
          transform: scale(0.98);
        }
        .kanban-card:hover {
          box-shadow: 0 3px 10px rgba(0,0,0,0.15);
          transform: translateY(-2px);
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          z-index: 1000;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .detail-section {
          margin-bottom: 25px;
        }
        .detail-section h3 {
          border-bottom: 1px solid #eee;
          padding-bottom: 8px;
          margin-bottom: 15px;
          font-size: 18px;
        }
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .file-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 10px;
        }
        .file-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .file-icon {
          color: #5e5e5e;
          background: #e9ecef;
          padding: 8px;
          border-radius: 8px;
        }
        .file-name {
          margin: 0 0 4px 0;
          font-weight: 500;
        }
        .file-size {
          margin: 0;
          font-size: 12px;
          color: #6c757d;
        }
        .file-download-btn {
          background: #e9ecef;
          color: #495057;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
        }
        .file-download-btn:hover {
          background: #dee2e6;
        }
        .evaluation-card {
          display: flex;
          gap: 20px;
          background: #f8f9fa;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 10px;
        }
        .score-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 120px;
        }
        .score-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
        .score-inner {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 16px;
        }
        .score-label {
          margin-top: 8px;
          font-size: 14px;
          color: #6c757d;
        }
        .evaluation-details {
          flex-grow: 1;
        }
        .evaluation-details h4 {
          margin: 10px 0;
          font-size: 15px;
          color: #495057;
        }
        .score-bars {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 15px;
        }
        .score-bar-item {
          width: 100%;
        }
        .score-bar-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 13px;
        }
        .score-bar-bg {
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }
        .score-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        .justification {
          background: white;
          padding: 10px;
          border-radius: 4px;
          font-size: 14px;
          line-height: 1.4;
          margin-bottom: 10px;
        }
        .question-feedback {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 15px;
        }
        .feedback-item {
          background: white;
          padding: 10px;
          border-radius: 4px;
        }
        .feedback-question {
          font-weight: 500;
          margin-bottom: 5px;
          font-size: 14px;
        }
        .feedback-answer {
          font-size: 13px;
          line-height: 1.4;
        }
        .eval-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #6c757d;
        }
        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr;
          }
          .evaluation-card {
            flex-direction: column;
          }
          .score-container {
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
};

export default Kanban;
