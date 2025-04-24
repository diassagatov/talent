import React, { useState, useEffect } from "react";
import $ from "jquery";
import "survey-creator-core/survey-creator-core.css";
import "survey-react/modern.css";
import * as Survey from "survey-core";
import * as SurveyJSUI from "survey-js-ui";
import { useParams } from "react-router-dom";

// Optionally import if needed, based on your project setup
// import { Model } from 'survey-core';

const ObserveInterview = () => {
  const { appId } = useParams();
  const [accessToken, setAccessToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submissionId, setSubmissionId] = useState("");
  const [submissionData, setSubmissionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const BASE_URL = "https://api.talentengine.tech";
  // const BASE_URL = "http://localhost:8000";

  useEffect(() => {
    // Get access token from localStorage
    const token = JSON.parse(localStorage.getItem("user_tokens"));
    if (token) {
      setAccessToken(token.access_token);
    }

    // Register custom question types for Survey.js
    Survey.Serializer.addClass("audio-record", [], null, "empty");
    Survey.Serializer.addClass("video-record", [], null, "empty");

    // Register audio recording widget for viewing
    Survey.CustomWidgetCollection.Instance.add({
      name: "audio-record",
      title: "Audio Record",
      iconName: "icon-audio",
      widgetIsLoaded: function () {
        return true; // Always return true for viewer
      },
      isFit: function (question) {
        return question.getType() === "audio-record";
      },
      htmlTemplate: "<div></div>",
      afterRender: function (question, el) {
        const uniqueId = `${question.name}_${question.id}`.replace(/\s+/g, "_");
        const currentSubmissionId = submissionId;

        el.innerHTML = `
          <div class="recorder-container audio-recorder-${uniqueId}">
            <audio controls style="width:100%; margin-top:10px;"></audio>
            <div class="media-filename"></div>
            <div class="transcript-accordion">
              <div class="transcript-header">Show transcript</div>
              <div class="transcript-content"></div>
            </div>
          </div>
        `;

        const container = el.querySelector(`.audio-recorder-${uniqueId}`);
        const audio = container.querySelector("audio");
        const filenameDiv = container.querySelector(".media-filename");
        const transcriptHeader = container.querySelector(".transcript-header");
        const transcriptContent = container.querySelector(
          ".transcript-content"
        );
        let transcriptFetched = false;

        // Update audio source when value changes
        const updateAudio = function (filePath) {
          if (filePath) {
            audio.src = filePath;
            audio.style.display = "block";
            filenameDiv.textContent = `File: ${filePath}`;
          } else {
            audio.style.display = "none";
            filenameDiv.textContent = "";
          }
        };

        // Fetch and display transcript
        async function fetchTranscript(questionId) {
          if (transcriptFetched) {
            return;
          }

          transcriptContent.innerHTML =
            '<div class="transcript-loading">Loading transcript...</div>';

          try {
            const response = await fetch(
              `${BASE_URL}/interviews/submissions/${submissionId}/media/${questionId}/transcript`
            );

            if (!response.ok) {
              throw new Error("Failed to fetch transcript");
            }

            const data = await response.json();
            transcriptContent.innerHTML = `<p>${data.transcript}</p>`;
            transcriptFetched = true;
          } catch (error) {
            transcriptContent.innerHTML = `<div class="transcript-error">Error loading transcript: ${error.message}</div>`;
          }
        }

        // Toggle transcript accordion
        transcriptHeader.addEventListener("click", function () {
          const isActive = transcriptHeader.classList.toggle("active");
          transcriptContent.classList.toggle("active");

          if (isActive && !transcriptFetched) {
            fetchTranscript(question.name);
          }
        });

        // Initial value
        updateAudio(question.value);

        // Listen for value changes
        question.valueChangedCallback = function () {
          updateAudio(question.value);
        };
      },
    });

    // Register video recording widget for viewing
    Survey.CustomWidgetCollection.Instance.add({
      name: "video-record",
      title: "Video Record",
      iconName: "icon-video",
      widgetIsLoaded: function () {
        return true; // Always return true for viewer
      },
      isFit: function (question) {
        return question.getType() === "video-record";
      },
      htmlTemplate: "<div></div>",
      afterRender: function (question, el) {
        const uniqueId = `${question.name}_${question.id}`.replace(/\s+/g, "_");

        el.innerHTML = `
          <div class="recorder-container video-recorder-${uniqueId}">
            <video controls style="width:100%; max-width:640px; margin-top:10px;"></video>
            <div class="media-filename"></div>
            <div class="transcript-accordion">
              <div class="transcript-header">Show transcript</div>
              <div class="transcript-content"></div>
            </div>
          </div>
        `;

        const container = el.querySelector(`.video-recorder-${uniqueId}`);
        const video = container.querySelector("video");
        const filenameDiv = container.querySelector(".media-filename");
        const transcriptHeader = container.querySelector(".transcript-header");
        const transcriptContent = container.querySelector(
          ".transcript-content"
        );
        let transcriptFetched = false;

        // Update video source when value changes
        const updateVideo = function (filePath) {
          if (filePath) {
            video.src = filePath;
            video.style.display = "block";
            filenameDiv.textContent = `File: ${filePath}`;
          } else {
            video.style.display = "none";
            filenameDiv.textContent = "";
          }
        };

        // Fetch and display transcript
        async function fetchTranscript(submissionId, questionId) {
          if (transcriptFetched) {
            return;
          }

          transcriptContent.innerHTML =
            '<div class="transcript-loading">Loading transcript...</div>';

          try {
            const response = await fetch(
              `${BASE_URL}/interviews/submissions/${submissionId}/media/${questionId}/transcript`
            );

            if (!response.ok) {
              throw new Error("Failed to fetch transcript");
            }

            const data = await response.json();
            transcriptContent.innerHTML = `<p>${data.transcript}</p>`;
            transcriptFetched = true;
          } catch (error) {
            transcriptContent.innerHTML = `<div class="transcript-error">Error loading transcript: ${error.message}</div>`;
          }
        }

        // Toggle transcript accordion
        transcriptHeader.addEventListener("click", function () {
          const isActive = transcriptHeader.classList.toggle("active");
          transcriptContent.classList.toggle("active");

          if (isActive && !transcriptFetched) {
            fetchTranscript(submissionId, question.id);
          }
        });

        // Initial value
        updateVideo(question.value);

        // Listen for value changes
        question.valueChangedCallback = function () {
          updateVideo(question.value);
        };
      },
    });
  }, [submissionId]);

  // Load submission when accessToken is available and component mounts
  useEffect(() => {
    if (accessToken && appId) {
      loadSubmission();
    }
  }, [accessToken, appId]);

  const loadSubmission = async () => {
    // Reset messages
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    if (!accessToken || !appId) {
      setErrorMessage("Missing authentication or application ID");
      setIsLoading(false);
      return;
    }

    try {
      // Get the submission data using the new endpoint
      const submissionResponse = await fetch(
        `${BASE_URL}/jobs/applications/${appId}/submission`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!submissionResponse.ok) {
        const error = await submissionResponse.json();
        throw new Error(error.detail || "Failed to load submission");
      }

      const responseData = await submissionResponse.json();
      setSubmissionData(responseData);
      // Store submission ID for transcript fetching
      setSubmissionId(responseData.submission_id);

      // Get the interview structure from the submission
      const interviewResponse = await fetch(
        `${BASE_URL}/interviews/${responseData.interview_id}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!interviewResponse.ok) {
        const error = await interviewResponse.json();
        throw new Error(error.detail || "Failed to load interview");
      }

      const interviewData = await interviewResponse.json();

      // Create the survey in read-only mode
      const survey = new Survey.Model(interviewData.interview_json);
      survey.mode = "display";
      survey.data = responseData.answers;

      // Render the survey
      $("#surveyContainer").Survey({ model: survey });
      setSuccessMessage("Submission loaded successfully!");
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="interview-container">
      {isLoading && (
        <div className="loading-message">
          Loading interview submission data...
        </div>
      )}

      {errorMessage && (
        <div className="error-message" style={{ display: "block" }}>
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="success-message" style={{ display: "block" }}>
          {successMessage}
        </div>
      )}

      <div id="surveyContainer" className="survey-scroll-container"></div>

      <style jsx>{`
        .interview-container {
          height: 100vh;
          max-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 20px;
          box-sizing: border-box;
        }

        .survey-scroll-container {
          flex: 1;
          overflow-y: auto;
          border-radius: 8px;
          background: white;
          padding: 20px;
          margin-top: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          max-height: calc(100vh - 120px);
        }

        .loading-message {
          padding: 20px;
          text-align: center;
          background-color: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 20px;
          color: #6c757d;
        }
        .error-message {
          color: #dc3545;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
          padding: 10px;
          margin: 10px 0;
          display: none;
        }
        .success-message {
          color: #28a745;
          background: #d4edda;
          border: 1px solid #c3e6cb;
          border-radius: 4px;
          padding: 10px;
          margin: 10px 0;
          display: none;
        }
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
        audio,
        video {
          margin-top: 10px;
          border-radius: 8px;
        }
        audio {
          width: 100%;
        }
        video {
          width: 100%;
          max-width: 640px;
          background: #000;
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

        @media (max-height: 800px) {
          .survey-scroll-container {
            max-height: calc(100vh - 100px);
          }
        }

        @media (max-width: 768px) {
          .interview-container {
            padding: 10px;
          }

          .survey-scroll-container {
            padding: 15px;
            max-height: calc(100vh - 90px);
          }
        }
      `}</style>
    </div>
  );
};

export default ObserveInterview;
