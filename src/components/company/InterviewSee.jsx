import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-creator-core/survey-creator-core.css";
import "survey-react/modern.css";

const InterviewSee = () => {
  const { vacancyId, accessToken } = useParams();
  const [interviewId, setInterviewId] = useState("");
  const [submissionId, setSubmissionId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [surveyModel, setSurveyModel] = useState(null);
  const [submissionData, setSubmissionData] = useState(null);
  const [mediaTranscripts, setMediaTranscripts] = useState({});
  const BASE_URL = "https://api.talentengine.tech";

  // Register custom question types
  useEffect(() => {
    // Register serializer classes
    if (window.Survey && !window.surveyTypesRegistered) {
      window.Survey.Serializer.addClass("audio-record", [], null, "empty");
      window.Survey.Serializer.addClass("video-record", [], null, "empty");
      window.surveyTypesRegistered = true;

      // Add custom question types to ComponentCollection if available
      if (window.Survey.ComponentCollection) {
        // Audio recording question type
        window.Survey.ComponentCollection.Instance.add({
          name: "audio-record",
          title: "Audio Recording",
          questionJSON: {
            type: "html",
            name: "audio_question",
            title: "Record Audio",
            description: "Click to record audio",
            html: `
              <div class="audio-record-preview">
                <div style="padding: 10px; background: #f8f9fa; border-radius: 4px;">
                  <div style="color: #666;">
                    <i class="fa fa-microphone"></i> Audio Recording
                  </div>
                  <div class="custom-question-description">
                    Click to record audio
                  </div>
                  <audio controls style="margin-top: 10px; width: 100%;">
                    <source src="" type="audio/ogg">
                    Your browser does not support the audio element.
                  </audio>
                </div>
              </div>
            `,
          },
          onInit() {
            window.Survey.Serializer.addProperty("audio-record", {
              name: "audioFormat",
              default: "ogg",
              category: "general",
            });
          },
          inheritBaseProps: ["isRequired", "title", "description"],
        });

        // Video recording question type
        window.Survey.ComponentCollection.Instance.add({
          name: "video-record",
          title: "Video Recording",
          questionJSON: {
            type: "html",
            name: "video_question",
            title: "Record Video",
            description: "Click to record video",
            html: `
              <div class="video-record-preview">
                <div style="padding: 10px; background: #f8f9fa; border-radius: 4px;">
                  <div style="color: #666;">
                    <i class="fa fa-video-camera"></i> Video Recording
                  </div>
                  <div class="custom-question-description">
                    Click to record video
                  </div>
                  <video controls style="margin-top: 10px; width: 100%; max-width: 640px;">
                    <source src="" type="video/webm">
                    Your browser does not support the video element.
                  </video>
                </div>
              </div>
            `,
          },
          onInit() {
            window.Survey.Serializer.addProperty("video-record", {
              name: "videoFormat",
              default: "webm",
              category: "general",
            });
          },
          inheritBaseProps: ["isRequired", "title", "description"],
        });
      }
    }
  }, []);

  // Load submission data
  const loadSubmission = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!accessToken) {
      setErrorMessage("Access token is required");
      return;
    }

    if (!interviewId) {
      setErrorMessage("Interview ID is required");
      return;
    }

    if (!submissionId) {
      setErrorMessage("Submission ID is required");
      return;
    }

    try {
      // Get interview data
      const interviewResponse = await fetch(
        `${BASE_URL}/interviews/${interviewId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!interviewResponse.ok) {
        throw new Error("Failed to fetch interview data");
      }

      const interviewData = await interviewResponse.json();
      const surveyJSON = interviewData.survey_json;

      // Get submission data
      const submissionResponse = await fetch(
        `${BASE_URL}/submissions/${submissionId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!submissionResponse.ok) {
        throw new Error("Failed to fetch submission data");
      }

      const submissionData = await submissionResponse.json();
      setSubmissionData(submissionData);

      // Create survey model and load data
      const survey = new Model(surveyJSON);
      survey.mode = "display";
      survey.showNavigationButtons = "none";
      survey.showProgressBar = "off";
      survey.data = submissionData.answers || {};

      // Register custom widgets for displaying media
      registerCustomWidgets(survey, submissionData);

      setSurveyModel(survey);
      setSuccessMessage("Submission loaded successfully");
    } catch (error) {
      console.error("Error loading submission:", error);
      setErrorMessage(error.message || "Failed to load submission");
    }
  };

  // Register custom widgets for viewing audio and video recordings
  const registerCustomWidgets = (survey, submissionData) => {
    const audioWidget = {
      name: "audio-record",
      title: "Audio Record",
      iconName: "icon-audio",
      widgetIsLoaded: () => true,
      isFit: (question) => question.getType() === "audio-record",
      htmlTemplate: "<div></div>",
      afterRender: (question, el) =>
        renderMediaPlayer(question, el, "audio", submissionData),
    };

    const videoWidget = {
      name: "video-record",
      title: "Video Record",
      iconName: "icon-video",
      widgetIsLoaded: () => true,
      isFit: (question) => question.getType() === "video-record",
      htmlTemplate: "<div></div>",
      afterRender: (question, el) =>
        renderMediaPlayer(question, el, "video", submissionData),
    };

    if (window.Survey && window.Survey.CustomWidgetCollection) {
      const collection = window.Survey.CustomWidgetCollection.Instance;
      collection.add(audioWidget);
      collection.add(videoWidget);
    }
  };

  // Render media player (audio or video)
  const renderMediaPlayer = (question, el, mediaType, submissionData) => {
    const questionId = question.name;
    const filePath = question.value;

    // Create container for media player
    const containerId = `${questionId}_container`;
    el.innerHTML = `
      <div id="${containerId}" class="recorder-container">
        <${mediaType} controls style="width:100%; margin-top:10px;"></${mediaType}>
        <div class="media-filename"></div>
        <div class="transcript-accordion">
          <div class="transcript-header">Show transcript</div>
          <div class="transcript-content"></div>
        </div>
      </div>
    `;

    const container = document.getElementById(containerId);
    const player = container.querySelector(mediaType);
    const filenameDiv = container.querySelector(".media-filename");
    const transcriptHeader = container.querySelector(".transcript-header");
    const transcriptContent = container.querySelector(".transcript-content");

    // Update media source
    if (filePath) {
      player.src = filePath;
      player.style.display = "block";
      filenameDiv.textContent = `File: ${filePath}`;
    } else {
      player.style.display = "none";
      filenameDiv.textContent = "";
    }

    // Setup transcript accordion
    transcriptHeader.addEventListener("click", () => {
      transcriptHeader.classList.toggle("active");
      transcriptContent.classList.toggle("active");

      // Fetch transcript if not already loaded
      if (!mediaTranscripts[questionId] && submissionData) {
        fetchTranscript(submissionData.id, questionId, transcriptContent);
      }
    });
  };

  // Fetch transcript from API
  const fetchTranscript = async (
    submissionId,
    questionId,
    transcriptElement
  ) => {
    try {
      transcriptElement.innerHTML = `<div class="transcript-loading">Loading transcript...</div>`;

      const response = await fetch(
        `${BASE_URL}/submissions/${submissionId}/transcripts/${questionId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transcript");
      }

      const transcriptData = await response.json();

      if (transcriptData && transcriptData.text) {
        setMediaTranscripts((prev) => ({
          ...prev,
          [questionId]: transcriptData.text,
        }));

        transcriptElement.innerHTML = `<div>${transcriptData.text}</div>`;
      } else {
        transcriptElement.innerHTML = `<div class="transcript-error">No transcript available</div>`;
      }
    } catch (error) {
      console.error("Error fetching transcript:", error);
      transcriptElement.innerHTML = `<div class="transcript-error">Error loading transcript: ${error.message}</div>`;
    }
  };

  return (
    <div className="w-full min-h-screen p-5">
      <h1 className="text-2xl font-bold mb-5">Interview Dashboard</h1>

      <div className="bg-gray-100 rounded-lg p-5 mb-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interview ID
            </label>
            <input
              type="number"
              value={interviewId}
              onChange={(e) => setInterviewId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter interview ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Submission ID
            </label>
            <input
              type="number"
              value={submissionId}
              onChange={(e) => setSubmissionId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter submission ID"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={loadSubmission}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Load Submission
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <div className="survey-container">
        {surveyModel ? (
          <Survey model={surveyModel} />
        ) : (
          <div className="text-center p-10 text-gray-500">
            Enter interview and submission IDs and click "Load Submission" to
            view the data
          </div>
        )}
      </div>

      {/* Include Font Awesome for icons */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />

      <style jsx>{`
        .recorder-container {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin: 10px 0;
        }
        .media-filename {
          margin-top: 5px;
          font-size: 12px;
          color: #666;
        }
        .transcript-accordion {
          margin-top: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }
        .transcript-header {
          background-color: #f8f9fa;
          padding: 10px 15px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid #ddd;
        }
        .transcript-header:hover {
          background-color: #e9ecef;
        }
        .transcript-content {
          padding: 15px;
          display: none;
          background-color: white;
        }
        .transcript-content.active {
          display: block;
        }
        .transcript-header::after {
          content: "▼";
          font-size: 12px;
          transition: transform 0.3s ease;
        }
        .transcript-header.active::after {
          transform: rotate(180deg);
        }
        .transcript-loading {
          color: #666;
          font-style: italic;
        }
        .transcript-error {
          color: #dc3545;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default InterviewSee;
