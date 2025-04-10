import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { Model } from "survey-core";
import { Survey } from "survey-react-ui";
import "survey-creator-core/survey-creator-core.css";
import "survey-react/defaultV2.min.css";

const InterviewComplete = () => {
  const { vacancyId, accessToken } = useParams();
  const [interviewId, setInterviewId] = useState("");
  const [applicationId, setApplicationId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [surveyModel, setSurveyModel] = useState(null);
  const [showSurvey, setShowSurvey] = useState(false);
  const [currentSubmissionId, setCurrentSubmissionId] = useState(null);
  const mediaRecordersRef = useRef({});
  const BASE_URL = "https://api.talentengine.tech";

  // Register custom question types when component mounts
  useEffect(() => {
    // Register serializer classes
    if (window.Survey && !window.surveyTypesRegistered) {
      console.log("Registering custom question types");

      // First register the question types
      window.Survey.Serializer.addClass("audio-record", [], null, "empty");
      window.Survey.Serializer.addClass("video-record", [], null, "empty");

      // Add properties to the question types
      window.Survey.Serializer.addProperty("audio-record", {
        name: "audioFormat",
        default: "ogg",
        category: "general",
      });

      window.Survey.Serializer.addProperty("video-record", {
        name: "videoFormat",
        default: "webm",
        category: "general",
      });

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

  // Load interview and initialize survey
  const loadInterview = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setShowSurvey(false);

    if (!accessToken) {
      setErrorMessage("Access token is required");
      return;
    }

    if (!interviewId) {
      setErrorMessage("Interview ID is required");
      return;
    }

    if (!applicationId) {
      setErrorMessage("Application ID is required");
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
      // Use interview_json field instead of survey_json
      const surveyJSON =
        interviewData.interview_json || interviewData.survey_json;

      if (!surveyJSON) {
        throw new Error("Interview data is invalid or missing");
      }

      console.log("Survey JSON:", surveyJSON);

      // Check if the survey contains audio or video recording questions
      const hasCustomQuestions = checkForCustomQuestions(surveyJSON);
      if (!hasCustomQuestions) {
        console.warn(
          "No custom audio/video questions found in the survey JSON."
        );
      }

      // Create survey model
      const survey = new Model(surveyJSON);

      // Set survey properties
      survey.showNavigationButtons = true;
      survey.showCompletedPage = false;

      // Register custom widgets for audio and video recording
      registerCustomWidgets();

      // Log available question types for debugging
      console.log("Survey model created:", survey);
      // Instead of using getUsedQuestionTypes which doesn't exist
      if (survey.pages && survey.pages.length > 0) {
        const questionTypes = new Set();
        survey.pages.forEach((page) => {
          page.elements.forEach((element) => {
            questionTypes.add(element.getType());
          });
        });
        console.log("Question types in survey:", Array.from(questionTypes));
      }

      // Force refresh widgets to ensure they're properly registered
      if (window.Survey && window.Survey.CustomWidgetCollection) {
        const collection = window.Survey.CustomWidgetCollection.Instance;
        console.log(
          "Custom widgets registered:",
          collection.widgets.map((w) => w.name).join(", ")
        );
      }

      // Handle survey completion
      survey.onComplete.add(async (sender) => {
        await submitSurvey(sender.data);
      });

      setSurveyModel(survey);
      setShowSurvey(true);
      setSuccessMessage("Interview loaded successfully");
    } catch (error) {
      console.error("Error loading interview:", error);
      setErrorMessage(error.message || "Failed to load interview");
    }
  };

  // Register custom widgets for recording audio and video
  const registerCustomWidgets = () => {
    // Audio recording widget
    const audioWidget = {
      name: "audio-record",
      title: "Audio Record",
      iconName: "icon-audio",
      widgetIsLoaded: () => true,
      isFit: (question) => {
        console.log("Checking if audio widget fits:", question.getType());
        return question.getType() === "audio-record";
      },
      htmlTemplate: "<div></div>",
      afterRender: (question, el) => {
        console.log("Rendering audio widget for question:", question.name);
        const uniqueId = `${question.name}_${Date.now()}`.replace(/\s+/g, "_");

        // Create recorder UI
        el.innerHTML = `
          <div class="recorder-container" id="audio-recorder-${uniqueId}">
            <div class="recorder-controls">
              <button type='button' class='start-btn record-button'>Record</button>
              <button type='button' class='stop-btn record-button' disabled>Stop</button>
            </div>
            <div class="recording-indicator">Recording in progress...</div>
            <audio class='audio-preview' controls style='display:none'></audio>
            <div class="upload-status"></div>
          </div>
        `;

        setupMediaRecorder(question, el, uniqueId, "audio");
      },
    };

    // Video recording widget
    const videoWidget = {
      name: "video-record",
      title: "Video Record",
      iconName: "icon-video",
      widgetIsLoaded: () => true,
      isFit: (question) => {
        console.log("Checking if video widget fits:", question.getType());
        return question.getType() === "video-record";
      },
      htmlTemplate: "<div></div>",
      afterRender: (question, el) => {
        console.log("Rendering video widget for question:", question.name);
        const uniqueId = `${question.name}_${Date.now()}`.replace(/\s+/g, "_");

        // Create recorder UI
        el.innerHTML = `
          <div class="recorder-container" id="video-recorder-${uniqueId}">
            <div class="video-container">
              <video class="video-preview" autoplay muted></video>
            </div>
            <div class="recorder-controls">
              <button type='button' class='start-btn record-button'>Record</button>
              <button type='button' class='stop-btn record-button' disabled>Stop</button>
            </div>
            <div class="recording-indicator">Recording in progress...</div>
            <video class='recorded-video' controls style='display:none'></video>
            <div class="upload-status"></div>
          </div>
        `;

        setupMediaRecorder(question, el, uniqueId, "video");
      },
    };

    if (window.Survey && window.Survey.CustomWidgetCollection) {
      const collection = window.Survey.CustomWidgetCollection.Instance;
      collection.clear();
      collection.add(audioWidget);
      collection.add(videoWidget);
      console.log("Registered custom widgets:", collection.widgets.length);
    }
  };

  // Setup media recorder for audio or video
  const setupMediaRecorder = (question, el, uniqueId, mediaType) => {
    const containerId =
      mediaType === "audio"
        ? `audio-recorder-${uniqueId}`
        : `video-recorder-${uniqueId}`;
    const container = document.getElementById(containerId);

    if (!container) return;

    const startBtn = container.querySelector(".start-btn");
    const stopBtn = container.querySelector(".stop-btn");
    const recordingIndicator = container.querySelector(".recording-indicator");
    const uploadStatus = container.querySelector(".upload-status");
    const preview =
      mediaType === "audio"
        ? container.querySelector(".audio-preview")
        : container.querySelector(".recorded-video");

    // For video, we need a live preview too
    const livePreview =
      mediaType === "video" ? container.querySelector(".video-preview") : null;

    let mediaRecorder;
    let chunks = [];
    let recordedBlob = null;

    // Get media stream
    const constraints =
      mediaType === "audio" ? { audio: true } : { audio: true, video: true };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        // For video, show live preview
        if (livePreview) {
          livePreview.srcObject = stream;
        }

        mediaRecorder = new MediaRecorder(stream);
        mediaRecordersRef.current[question.name] = {
          recorder: mediaRecorder,
          stream: stream,
          chunks: chunks,
        };

        mediaRecorder.ondataavailable = (e) => {
          chunks.push(e.data);
        };

        mediaRecorder.onstop = async () => {
          recordedBlob = new Blob(chunks, {
            type:
              mediaType === "audio" ? "audio/ogg; codecs=opus" : "video/webm",
          });
          chunks = [];

          const url = URL.createObjectURL(recordedBlob);
          preview.src = url;
          preview.style.display = "block";

          // Set question value to null to indicate recording is complete but not uploaded
          question.value = null;

          // Upload the recorded media file
          await uploadMedia(question, recordedBlob, mediaType, uploadStatus);

          // Stop all tracks in the stream
          stream.getTracks().forEach((track) => track.stop());
        };
      })
      .catch((err) => {
        console.error(`Error accessing ${mediaType} device:`, err);
        startBtn.disabled = true;
        stopBtn.disabled = true;
        container.innerHTML += `<div class="error">Error: ${err.message}</div>`;
      });

    // Start recording
    startBtn.addEventListener("click", () => {
      const recorderData = mediaRecordersRef.current[question.name];
      if (recorderData && recorderData.recorder) {
        recorderData.chunks = [];
        recorderData.recorder.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
        recordingIndicator.classList.add("active");
        uploadStatus.textContent = "";
      }
    });

    // Stop recording
    stopBtn.addEventListener("click", () => {
      const recorderData = mediaRecordersRef.current[question.name];
      if (
        recorderData &&
        recorderData.recorder &&
        recorderData.recorder.state === "recording"
      ) {
        recorderData.recorder.stop();
        startBtn.disabled = false;
        stopBtn.disabled = true;
        recordingIndicator.classList.remove("active");
      }
    });
  };

  // Upload media to server
  const uploadMedia = async (question, blob, mediaType, statusElement) => {
    if (!blob || !currentSubmissionId) return;

    try {
      statusElement.textContent = "Uploading...";

      // Create form data
      const formData = new FormData();
      formData.append(
        "file",
        blob,
        `${question.name}.${mediaType === "audio" ? "ogg" : "webm"}`
      );

      // Upload the file
      const response = await fetch(
        `${BASE_URL}/submissions/${currentSubmissionId}/media/${question.name}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload media file");
      }

      const result = await response.json();

      // Update question value with the media URL
      question.value = result.url;
      statusElement.textContent = "Upload successful";
    } catch (error) {
      console.error("Error uploading media:", error);
      statusElement.textContent = `Upload failed: ${error.message}`;
    }
  };

  // Submit survey answers
  const submitSurvey = async (data) => {
    try {
      setSuccessMessage("");
      setErrorMessage("");

      // First, create a submission
      const createResponse = await fetch(
        `${BASE_URL}/submissions/create/${interviewId}/${applicationId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ answers: {} }),
        }
      );

      if (!createResponse.ok) {
        throw new Error("Failed to create submission");
      }

      const submissionData = await createResponse.json();
      setCurrentSubmissionId(submissionData.id);

      // Then, update the submission with answers
      const updateResponse = await fetch(
        `${BASE_URL}/submissions/${submissionData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            answers: data,
            status: "completed",
          }),
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to update submission");
      }

      setSuccessMessage("Interview submitted successfully!");
    } catch (error) {
      console.error("Error submitting survey:", error);
      setErrorMessage(error.message || "Failed to submit interview");
    }
  };

  // Add more custom component handling after component is mounted
  useEffect(() => {
    if (surveyModel) {
      // This will run after the survey model is created and rendered
      setTimeout(() => {
        const audioQuestions = document.querySelectorAll(
          ".audio-record-preview"
        );
        if (audioQuestions.length > 0) {
          audioQuestions.forEach((question) => {
            setupAudioRecorder(question);
          });
        }

        const videoQuestions = document.querySelectorAll(
          ".video-record-preview"
        );
        if (videoQuestions.length > 0) {
          videoQuestions.forEach((question) => {
            setupVideoRecorder(question);
          });
        }
      }, 500);
    }
  }, [surveyModel, showSurvey]);

  // Setup audio recorder for questions
  const setupAudioRecorder = (element) => {
    // Setup logic would go here
    console.log("Setting up audio recorder for", element);
    // Add record button if not already present
    if (!element.querySelector(".record-button")) {
      const recordControls = document.createElement("div");
      recordControls.className = "recorder-controls";
      recordControls.innerHTML = `
        <button type='button' class='start-btn record-button'>Record</button>
        <button type='button' class='stop-btn record-button' disabled>Stop</button>
      `;
      const audioEl = element.querySelector("audio");
      if (audioEl) {
        audioEl.insertAdjacentElement("beforebegin", recordControls);
      }
    }
  };

  // Setup video recorder for questions
  const setupVideoRecorder = (element) => {
    // Setup logic would go here
    console.log("Setting up video recorder for", element);
    // Add record button if not already present
    if (!element.querySelector(".record-button")) {
      const recordControls = document.createElement("div");
      recordControls.className = "recorder-controls";
      recordControls.innerHTML = `
        <button type='button' class='start-btn record-button'>Record</button>
        <button type='button' class='stop-btn record-button' disabled>Stop</button>
      `;
      const videoEl = element.querySelector("video");
      if (videoEl) {
        videoEl.insertAdjacentElement("beforebegin", recordControls);
      }
    }
  };

  // Helper function to check for custom questions in the survey JSON
  const checkForCustomQuestions = (json) => {
    let hasCustom = false;

    // Helper function to recursively check for custom questions
    const checkObject = (obj) => {
      if (!obj) return;

      if (Array.isArray(obj)) {
        obj.forEach((item) => checkObject(item));
        return;
      }

      if (typeof obj === "object") {
        if (obj.type === "audio-record" || obj.type === "video-record") {
          hasCustom = true;
          console.log("Found custom question:", obj);
        }

        Object.values(obj).forEach((value) => checkObject(value));
      }
    };

    checkObject(json);
    return hasCustom;
  };

  return (
    <div className="w-full min-h-screen p-5">
      <h1 className="text-2xl font-bold mb-5">Interview Submission</h1>

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
              disabled={showSurvey}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application ID
            </label>
            <input
              type="number"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter application ID"
              disabled={showSurvey}
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={loadInterview}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={showSurvey}
            >
              Load Interview
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

      <div className={`survey-container ${showSurvey ? "block" : "hidden"}`}>
        {surveyModel && <Survey model={surveyModel} />}
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
        .video-container {
          margin: 10px 0;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
        }
        .video-preview,
        .recorded-video {
          width: 100%;
          max-width: 640px;
          background: #000;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default InterviewComplete;
