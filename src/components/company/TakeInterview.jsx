import React, { useState, useEffect, useRef } from "react";
import * as Survey from "survey-core";
import { Survey as SurveyComponent } from "survey-react-ui";
import "survey-creator-core/survey-creator-core.css";
import "survey-react/modern.css";
import { useParams } from "react-router-dom";

function TakeInterview() {
  const { intId, appId } = useParams();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [survey, setSurvey] = useState(null);
  const surveyRef = useRef(null);

  const BASE_URL = "https://api.talentengine.tech";
  // const BASE_URL = "http://localhost:8000";

  useEffect(() => {
    // Register custom question types
    Survey.Serializer.addClass("audio-record", [], null, "empty");
    Survey.Serializer.addClass("video-record", [], null, "empty");

    registerCustomWidgets();

    // Automatically load the interview when component mounts
    if (intId && appId) {
      loadInterview();
    }
  }, [intId, appId]);

  const registerCustomWidgets = () => {
    // Register audio recording widget
    Survey.CustomWidgetCollection.Instance.add({
      name: "audio-record",
      title: "Audio Record",
      iconName: "icon-audio",
      widgetIsLoaded: function () {
        const isLoaded = !!window.MediaRecorder;
        console.log("Audio widget loaded:", isLoaded);
        return isLoaded;
      },
      isFit: function (question) {
        const fits = question.getType() === "audio-record";
        console.log("Audio widget fits for question:", question.name, fits);
        return fits;
      },
      htmlTemplate: "<div></div>",
      afterRender: function (question, el) {
        const uniqueId = `${question.name}_${question.id}`.replace(/\s+/g, "_");

        el.innerHTML = `
          <div class="recorder-container audio-recorder-${uniqueId}">
            <div class="recorder-controls">
              <button type='button' class='start-btn record-button'>Record</button>
              <button type='button' class='stop-btn record-button' disabled>Stop</button>
            </div>
            <div class="recording-indicator">Recording in progress...</div>
            <audio class='audio-preview' controls style='display:none'></audio>
            <div class="upload-status"></div>
          </div>
        `;

        const container = el.querySelector(`.audio-recorder-${uniqueId}`);
        const startBtn = container.querySelector(".start-btn");
        const stopBtn = container.querySelector(".stop-btn");
        const audioPreview = container.querySelector(".audio-preview");
        const recordingIndicator = container.querySelector(
          ".recording-indicator"
        );
        const uploadStatus = container.querySelector(".upload-status");

        let mediaRecorder;
        let chunks = [];
        let recordedBlob = null;

        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then(function (stream) {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = function (e) {
              chunks.push(e.data);
            };
            mediaRecorder.onstop = function () {
              recordedBlob = new Blob(chunks, {
                type: "audio/ogg; codecs=opus",
              });
              chunks = [];
              const url = URL.createObjectURL(recordedBlob);
              audioPreview.src = url;
              audioPreview.style.display = "block";
              question.value = null; // Set to null to indicate media needs to be uploaded
            };
          })
          .catch(function (err) {
            console.error("Error accessing audio device:", err);
            startBtn.disabled = true;
            stopBtn.disabled = true;
            container.innerHTML += `<div class="error">Error: ${err.message}</div>`;
          });

        startBtn.addEventListener("click", function () {
          if (mediaRecorder) {
            chunks = [];
            mediaRecorder.start();
            startBtn.disabled = true;
            stopBtn.disabled = false;
            recordingIndicator.classList.add("active");
            uploadStatus.textContent = "";
          }
        });

        stopBtn.addEventListener("click", function () {
          if (mediaRecorder) {
            mediaRecorder.stop();
            startBtn.disabled = false;
            stopBtn.disabled = true;
            recordingIndicator.classList.remove("active");
          }
        });

        // Add method to upload the recorded audio
        question.uploadMedia = async function (submissionId) {
          if (!recordedBlob) {
            console.warn(`No recorded audio for question ${question.name}`);
            return;
          }

          try {
            const formData = new FormData();
            formData.append("file", recordedBlob, "recording.ogg");

            const response = await fetch(
              `${BASE_URL}/interviews/submissions/${submissionId}/media/${question.name}`,
              {
                method: "POST",
                body: formData,
              }
            );

            if (!response.ok) {
              throw new Error(`Failed to upload audio for ${question.name}`);
            }

            const result = await response.json();
            uploadStatus.textContent = "Upload successful";
            uploadStatus.style.color = "#28a745";
            return result.url;
          } catch (error) {
            console.error("Error uploading audio:", error);
            uploadStatus.textContent = "Upload failed: " + error.message;
            uploadStatus.style.color = "#dc3545";
            throw error;
          }
        };
      },
    });

    // Register video recording widget
    Survey.CustomWidgetCollection.Instance.add({
      name: "video-record",
      title: "Video Record",
      iconName: "icon-video",
      widgetIsLoaded: function () {
        const isLoaded = !!window.MediaRecorder;
        console.log("Video widget loaded:", isLoaded);
        return isLoaded;
      },
      isFit: function (question) {
        const fits = question.getType() === "video-record";
        console.log("Video widget fits for question:", question.name, fits);
        return fits;
      },
      htmlTemplate: "<div></div>",
      afterRender: function (question, el) {
        const uniqueId = `${question.name}_${question.id}`.replace(/\s+/g, "_");

        el.innerHTML = `
          <div class="recorder-container video-recorder-${uniqueId}">
            <video class='video-preview' width='640' height='360' autoplay muted></video>
            <div class="recorder-controls">
              <button type='button' class='start-btn record-button'>Record</button>
              <button type='button' class='stop-btn record-button' disabled>Stop</button>
            </div>
            <div class="recording-indicator">Recording in progress...</div>
            <div class="video-duration"></div>
            <div class="upload-status"></div>
          </div>
        `;

        const container = el.querySelector(`.video-recorder-${uniqueId}`);
        const startBtn = container.querySelector(".start-btn");
        const stopBtn = container.querySelector(".stop-btn");
        const videoPreview = container.querySelector(".video-preview");
        const recordingIndicator = container.querySelector(
          ".recording-indicator"
        );
        const uploadStatus = container.querySelector(".upload-status");
        const durationDisplay = container.querySelector(".video-duration");

        let mediaRecorder;
        let chunks = [];
        let stream;
        let recordedBlob = null;
        let recordingStartTime;
        let recordingDuration;

        // Function to format duration in MM:SS format
        function formatDuration(seconds) {
          const minutes = Math.floor(seconds / 60);
          const remainingSeconds = Math.floor(seconds % 60);
          return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
            .toString()
            .padStart(2, "0")}`;
        }

        // Function to get supported mime type
        function getSupportedMimeType() {
          const types = [
            "video/mp4;codecs=h264,aac",
            "video/mp4",
            "video/webm;codecs=h264",
            "video/webm",
          ];

          for (const type of types) {
            if (MediaRecorder.isTypeSupported(type)) {
              return type;
            }
          }
          return "video/webm"; // Fallback to WebM if nothing else is supported
        }

        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then(function (mediaStream) {
            stream = mediaStream;
            videoPreview.srcObject = stream;

            const mimeType = getSupportedMimeType();
            console.log("Using MIME type:", mimeType);

            mediaRecorder = new MediaRecorder(stream, {
              mimeType: mimeType,
              videoBitsPerSecond: 2500000, // 2.5 Mbps for better quality
            });

            mediaRecorder.ondataavailable = function (e) {
              chunks.push(e.data);
            };

            mediaRecorder.onstop = function () {
              const fileExtension = mimeType.includes("mp4") ? "mp4" : "webm";
              recordedBlob = new Blob(chunks, { type: mimeType });
              chunks = [];

              // Create object URL for preview
              const url = URL.createObjectURL(recordedBlob);
              videoPreview.srcObject = null;
              videoPreview.src = url;
              videoPreview.controls = true;

              // Load metadata to get duration
              videoPreview.onloadedmetadata = function () {
                recordingDuration = videoPreview.duration;
                durationDisplay.textContent = `Duration: ${formatDuration(
                  recordingDuration
                )}`;
                durationDisplay.style.display = "block";
              };

              question.value = null; // Set to null to indicate media needs to be uploaded
            };
          })
          .catch(function (err) {
            console.error("Error accessing video device:", err);
            startBtn.disabled = true;
            stopBtn.disabled = true;
            container.innerHTML += `<div class="error">Error: ${err.message}</div>`;
          });

        startBtn.addEventListener("click", function () {
          if (mediaRecorder) {
            chunks = [];
            videoPreview.srcObject = stream;
            videoPreview.controls = false;
            recordingStartTime = Date.now();
            durationDisplay.style.display = "none";

            // Start recording in 100ms chunks to enable duration tracking
            mediaRecorder.start(100);

            startBtn.disabled = true;
            stopBtn.disabled = false;
            recordingIndicator.classList.add("active");
            uploadStatus.textContent = "";

            // Update duration while recording
            const durationTimer = setInterval(() => {
              const currentDuration = (Date.now() - recordingStartTime) / 1000;
              durationDisplay.textContent = `Recording: ${formatDuration(
                currentDuration
              )}`;
              durationDisplay.style.display = "block";
            }, 1000);

            // Store the timer ID in the button to clear it later
            startBtn.dataset.durationTimer = durationTimer;
          }
        });

        stopBtn.addEventListener("click", function () {
          if (mediaRecorder) {
            mediaRecorder.stop();
            startBtn.disabled = false;
            stopBtn.disabled = true;
            recordingIndicator.classList.remove("active");

            // Clear the duration update timer
            if (startBtn.dataset.durationTimer) {
              clearInterval(parseInt(startBtn.dataset.durationTimer));
              delete startBtn.dataset.durationTimer;
            }
          }
        });

        // Add method to upload the recorded video
        question.uploadMedia = async function (submissionId) {
          if (!recordedBlob) {
            console.warn(`No recorded video for question ${question.name}`);
            return;
          }

          try {
            const formData = new FormData();
            const fileExtension = recordedBlob.type.includes("mp4")
              ? "mp4"
              : "webm";
            formData.append("file", recordedBlob, `recording.${fileExtension}`);

            // Add duration metadata if available
            if (recordingDuration) {
              formData.append("duration", Math.round(recordingDuration));
            }

            const response = await fetch(
              `${BASE_URL}/interviews/submissions/${submissionId}/media/${question.name}`,
              {
                method: "POST",
                body: formData,
              }
            );

            if (!response.ok) {
              throw new Error(`Failed to upload video for ${question.name}`);
            }

            const result = await response.json();
            uploadStatus.textContent = "Upload successful";
            uploadStatus.style.color = "#28a745";
            return result.url;
          } catch (error) {
            console.error("Error uploading video:", error);
            uploadStatus.textContent = "Upload failed: " + error.message;
            uploadStatus.style.color = "#dc3545";
            throw error;
          }
        };
      },
      willUnmount: function (question, el) {
        const uniqueId = `${question.name}_${question.id}`.replace(/\s+/g, "_");
        const container = el.querySelector(`.video-recorder-${uniqueId}`);
        if (container) {
          const videoPreview = container.querySelector(".video-preview");
          if (videoPreview && videoPreview.srcObject) {
            videoPreview.srcObject.getTracks().forEach((track) => track.stop());
          }
        }
      },
    });
  };

  const loadInterview = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!intId) {
      setErrorMessage("Interview ID is missing");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/interviews/${intId}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to load interview");
      }

      const result = await response.json();
      initializeSurvey(result.interview_json);
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const initializeSurvey = (surveyJson) => {
    // Clean up any existing survey
    if (surveyRef.current) {
      surveyRef.current.dispose();
    }

    // Create the survey
    const survey = new Survey.Model(surveyJson);
    surveyRef.current = survey;

    // Handle survey completion
    survey.onComplete.add(async function (sender, options) {
      try {
        // Prepare answers object with all questions, setting media questions to null
        const answers = {};
        sender.getAllQuestions().forEach((question) => {
          const questionType = question.getType();
          // Set null for media questions, actual value for others
          answers[question.name] = ["audio-record", "video-record"].includes(
            questionType
          )
            ? null
            : sender.data[question.name];
        });

        // Step 1: Create initial submission with null values for media questions
        const response = await fetch(
          `${BASE_URL}/interviews/submissions/?interview_id=${parseInt(
            intId
          )}&application_id=${parseInt(appId)}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              answers: answers,
            }),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.detail || "Failed to submit interview");
        }

        const { submission_id } = await response.json();

        // Step 2: Upload media files
        const mediaQuestions = sender
          .getAllQuestions()
          .filter((q) =>
            ["audio-record", "video-record"].includes(q.getType())
          );

        // Upload all media files in parallel
        const uploadPromises = mediaQuestions.map((question) =>
          question.uploadMedia(submission_id)
        );

        await Promise.all(uploadPromises);

        // Step 3: Verify final submission
        const verifyResponse = await fetch(
          `${BASE_URL}/interviews/submissions/${submission_id}`
        );
        if (!verifyResponse.ok) {
          throw new Error("Failed to verify submission");
        }

        setSuccessMessage("Interview submitted successfully!");
      } catch (error) {
        setErrorMessage(error.message);
        options.showDataSaving(); // Allow retrying the submission
      }
    });

    // Set survey in state for React rendering
    setSurvey(survey);
  };

  return (
    <div className="interview-page">
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

      {!intId || !appId ? (
        <div className="error-message" style={{ display: "block" }}>
          Missing required parameters. Please ensure the URL includes both
          interview and application IDs.
        </div>
      ) : !survey ? (
        <div>Loading interview...</div>
      ) : (
        <div className="interview-container">
          <SurveyComponent model={survey} />
        </div>
      )}

      <style jsx>{`
        .interview-page {
          max-width: 100%;
          box-sizing: border-box;
        }
        .interview-container {
          height: calc(100vh - 150px);
          overflow-y: auto;
          padding: 0 10px;
          border-radius: 8px;
          background-color: #fff;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
        .survey-container {
          display: none;
        }
        /* Recorder Styles */
        .recorder-container {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin: 10px 0;
        }
        .recorder-controls {
          display: flex;
          gap: 10px;
          margin: 15px 0;
        }
        .record-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 25px;
          border: none;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .start-btn {
          background-color: #dc3545;
          color: white;
        }
        .start-btn:hover {
          background-color: #c82333;
        }
        .start-btn::before {
          content: "●";
          color: white;
        }
        .stop-btn {
          background-color: #6c757d;
          color: white;
        }
        .stop-btn:hover {
          background-color: #5a6268;
        }
        .stop-btn::before {
          content: "■";
          color: white;
        }
        .record-button:disabled {
          background-color: #e9ecef;
          color: #6c757d;
          cursor: not-allowed;
          opacity: 0.65;
        }
        .recording-indicator {
          display: none;
          align-items: center;
          gap: 8px;
          color: #dc3545;
          font-size: 14px;
          margin-top: 10px;
        }
        .recording-indicator.active {
          display: flex;
        }
        .recording-indicator::before {
          content: "●";
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export default TakeInterview;
