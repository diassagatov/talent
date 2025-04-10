import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import "survey-creator-core/survey-creator-core.css";
import "survey-react/modern.css";

const InterviewCreator = () => {
  const { vacancyId, accessToken } = useParams();
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const creatorRef = useRef(null);
  const BASE_URL = "https://api.talentengine.tech";

  // Initialize and register custom question types
  useEffect(() => {
    // We need to wait for the SurveyJS libraries to be loaded
    if (!window.Survey || !window.SurveyCreator) {
      const script1 = document.createElement("script");
      script1.src = "https://unpkg.com/survey-core@2.0.0/survey.core.min.js";
      script1.async = true;

      const script2 = document.createElement("script");
      script2.src = "https://unpkg.com/survey-js-ui@2.0.0/survey-js-ui.min.js";
      script2.async = true;

      const script3 = document.createElement("script");
      script3.src =
        "https://unpkg.com/survey-creator-core@2.0.0/survey-creator-core.min.js";
      script3.async = true;

      const script4 = document.createElement("script");
      script4.src =
        "https://unpkg.com/survey-creator-js@2.0.0/survey-creator-js.min.js";
      script4.async = true;

      document.body.appendChild(script1);
      document.body.appendChild(script2);
      document.body.appendChild(script3);
      document.body.appendChild(script4);

      script4.onload = initializeSurvey;

      return () => {
        document.body.removeChild(script1);
        document.body.removeChild(script2);
        document.body.removeChild(script3);
        document.body.removeChild(script4);
      };
    } else {
      initializeSurvey();
    }

    function initializeSurvey() {
      try {
        // Register custom question types using ComponentCollection
        if (window.Survey && window.Survey.ComponentCollection) {
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

        // Initialize creator with options exactly like in the HTML file
        const creator = new window.SurveyCreator.SurveyCreator({
          showLogicTab: true,
          isAutoSave: true,
          showJSONEditor: true,
          showPreviewTab: true,
        });

        // Set default JSON
        creator.JSON = {
          title: "New Interview",
          description: "Interview Description",
          pages: [
            {
              name: "page1",
              elements: [],
            },
          ],
        };

        // Store reference to the creator
        creatorRef.current = creator;

        // Render the creator
        creator.render("creatorContainer");

        // Remove SurveyJS banner after a delay
        setTimeout(() => {
          const banner = document.querySelector(".svc-creator__banner");
          if (banner) {
            banner.remove();
          }
        }, 500);
      } catch (error) {
        console.error("Error initializing survey creator:", error);
        setErrorMessage(
          "Failed to initialize survey creator. Please try again."
        );
      }
    }
  }, []);

  const handleSaveInterview = async () => {
    // Reset messages
    setErrorMessage("");
    setSuccessMessage("");

    if (!accessToken || !vacancyId || !creatorRef.current) {
      setErrorMessage("Access token, vacancy ID, or creator is missing");
      return;
    }

    try {
      const surveyJSON = creatorRef.current.JSON;
      const response = await fetch(
        `${BASE_URL}/interviews/create/${vacancyId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            title: surveyJSON.title || "New Interview",
            description: surveyJSON.description || "",
            survey_json: surveyJSON,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to create interview");
      }

      const result = await response.json();
      setSuccessMessage(
        `Interview created successfully! Interview ID: ${result.id}`
      );
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "An error occurred");
    }
  };

  return (
    <div className="w-full min-h-screen p-5">
      <h1 className="text-2xl font-bold mb-5">Interview Creator</h1>

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

      <div className="mb-5">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleSaveInterview}
          disabled={!creatorRef.current}
        >
          Create Interview
        </button>
      </div>

      <div id="creatorContainer" className="h-[calc(100vh-250px)]"></div>

      {/* Include Font Awesome for icons used in the custom questions */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />
    </div>
  );
};

export default InterviewCreator;
