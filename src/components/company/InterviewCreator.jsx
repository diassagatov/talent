import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import "survey-core";
import "survey-creator-core/survey-creator-core.css";
import "survey-react/defaultV2.css";

const InterviewCreator = () => {
  const { vacancyId } = useParams();
  const accessToken = JSON.parse(
    localStorage.getItem("user_tokens")
  ).access_token;
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
          // Define the custom question types first
          const audioRecordDef = {
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
          };

          // Video recording question type definition
          const videoRecordDef = {
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
          };

          // Register with ComponentCollection
          console.log(
            "Registering audio-record and video-record with ComponentCollection"
          );
          window.Survey.ComponentCollection.Instance.add(audioRecordDef);
          window.Survey.ComponentCollection.Instance.add(videoRecordDef);

          // Register audio-record type with Serializer
          if (!window.Survey.Serializer.findClass("audio-record")) {
            console.log("Registering audio-record with Serializer");
            window.Survey.Serializer.addClass(
              "audio-record",
              [],
              null,
              "empty"
            );
            window.Survey.Serializer.addProperty("audio-record", {
              name: "audioFormat",
              default: "ogg",
              category: "general",
            });
          }

          // Register video-record type with Serializer
          if (!window.Survey.Serializer.findClass("video-record")) {
            console.log("Registering video-record with Serializer");
            window.Survey.Serializer.addClass(
              "video-record",
              [],
              null,
              "empty"
            );
            window.Survey.Serializer.addProperty("video-record", {
              name: "videoFormat",
              default: "webm",
              category: "general",
            });
          }
        }

        // Initialize creator with options
        const creator = new window.SurveyCreator.SurveyCreator({
          showLogicTab: true,
          isAutoSave: true,
          showJSONEditor: true, // Enable JSON editor for debugging
          showPreviewTab: true,
        });

        // Add custom components to the creator's toolbox
        console.log("Configuring creator toolbox for custom components");
        try {
          // Add custom questions to creator's toolbox
          creator.toolbox.addItem({
            name: "audio-record",
            title: "Audio Recording",
            iconName: "icon-toolbox-radiogroup-24x24",
            json: {
              type: "audio-record",
              name: "audio_question",
              title: "Record Audio",
              description: "Click to record audio",
            },
          });

          creator.toolbox.addItem({
            name: "video-record",
            title: "Video Recording",
            iconName: "icon-camera-32x32",
            json: {
              type: "video-record",
              name: "video_question",
              title: "Record Video",
              description: "Click to record video",
            },
          });

          console.log(
            "Successfully added custom components to creator toolbox"
          );
        } catch (toolboxError) {
          console.error("Error adding components to toolbox:", toolboxError);
        }

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

    console.log("handleSaveInterview called");
    console.log("accessToken exists:", !!accessToken);
    console.log("vacancyId:", vacancyId);
    console.log("creatorRef.current exists:", !!creatorRef.current);

    if (!accessToken || !vacancyId || !creatorRef.current) {
      console.error("Missing required data:", {
        accessToken: !!accessToken,
        vacancyId,
        creatorRef: !!creatorRef.current,
      });
      setErrorMessage("Access token, vacancy ID, or creator is missing");
      return;
    }

    try {
      const surveyJSON = creatorRef.current.JSON;
      console.log("Survey JSON:", surveyJSON);

      console.log(
        "Making API request to:",
        `${BASE_URL}/interviews/create/${vacancyId}`
      );
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

      console.log("Response status:", response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error("API error response:", error);
        throw new Error(error.detail || "Failed to create interview");
      }

      const result = await response.json();
      console.log("API success response:", result);
      setSuccessMessage(
        `Interview created successfully! Interview ID: ${result.id}`
      );
    } catch (error) {
      console.error("Error in handleSaveInterview:", error);
      setErrorMessage(error.message || "An error occurred");
    }
  };

  // Add a specific event handler to see if the button click is registered
  const handleButtonClick = () => {
    console.log("Create Interview button clicked");
    handleSaveInterview();
  };

  return (
    <div className="w-full h-screen flex flex-col p-4 pt-[100px] overflow-hidden">
      <div className="mb-5 flex justify-between items-center">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleButtonClick}
          disabled={!creatorRef.current}
        >
          Create Interview
        </button>

        <div className="flex-1 ml-4">
          {errorMessage && (
            <div className="bg-red-100 border border-red-200 text-red-700 py-2 px-4 rounded">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-100 border border-green-200 text-green-700 py-2 px-4 rounded">
              {successMessage}
            </div>
          )}
        </div>
      </div>

      <div
        id="creatorContainer"
        className="survey-creator-container flex-1"
      ></div>

      {/* Include Font Awesome for icons used in the custom questions */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />

      {/* Add custom CSS to fix scrolling issues */}
      <style jsx>{`
        .survey-creator-container {
          width: 100%;
          height: calc(100vh - 120px) !important;
          max-height: calc(100vh - 120px) !important;
          overflow: hidden;
        }

        /* Override SurveyJS styles to fix layout issues */
        :global(.sv-root-modern) {
          height: 100% !important;
          width: 100% !important;
          max-width: 100% !important;
        }

        :global(.svc-creator) {
          height: 100% !important;
          max-height: 100% !important;
          overflow: hidden !important;
        }

        /* Make the toolbox (question types menu) scrollable */
        :global(.svc-creator__toolbox) {
          height: 100% !important;
          overflow-y: auto !important;
          flex-shrink: 0 !important;
          max-height: 100% !important;
          border-right: 1px solid #eee;
        }

        :global(.svc-toolbox) {
          height: 100% !important;
          overflow-y: auto !important;
          padding-bottom: 20px !important;
        }

        :global(.svc-toolbox__category) {
          overflow: visible !important;
        }

        :global(.svc-toolbox__category-header) {
          position: sticky !important;
          top: 0 !important;
          background: white !important;
          z-index: 10 !important;
        }

        /* Main content area container */
        :global(.svc-creator__area-container) {
          height: 100% !important;
          max-height: 100% !important;
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
        }

        :global(.svc-creator__content-wrapper) {
          height: 100% !important;
          max-height: 100% !important;
          overflow: hidden !important;
          flex: 1 !important;
        }

        :global(.svc-creator__content-holder) {
          height: 100% !important;
          overflow: hidden !important;
        }

        /* Make the tab content scrollable */
        :global(.svc-tab-designer) {
          height: 100% !important;
          overflow: hidden !important;
          display: flex !important;
          flex-direction: column !important;
        }

        /* Make the questions area scrollable */
        :global(.svc-tab-designer__content-wrapper) {
          height: auto !important;
          overflow-y: auto !important;
          flex: 1 !important;
          min-height: 0 !important;
          padding-bottom: 100px !important;
        }

        :global(.svc-tab-designer__content) {
          height: auto !important;
          min-height: 0 !important;
        }

        /* Ensure the page editor takes full height */
        :global(.svc-page-editor) {
          min-height: 100% !important;
          overflow-y: auto !important;
        }

        /* Specifically target the question content area */
        :global(.svc-page) {
          overflow: visible !important;
          min-height: 100px !important;
        }

        /* Fix tabs and scrolling for each tab */
        :global(.svc-creator-tab) {
          overflow: hidden !important;
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
        }

        :global(.svc-plugin-tab__content) {
          height: 100% !important;
          overflow-y: auto !important;
          flex: 1 !important;
        }

        :global(.svc-json-editor) {
          height: 100% !important;
          overflow: auto !important;
        }

        :global(.svc-preview__content) {
          height: 100% !important;
          overflow: auto !important;
        }

        /* Fix for the scrollable containers */
        :global(.sd-root--modern) {
          width: 100% !important;
          height: 100% !important;
        }

        :global(.sd-container-modern) {
          overflow-y: auto !important;
        }

        :global(.svc-designer-header) {
          position: sticky !important;
          top: 0 !important;
          z-index: 11 !important;
          background: white !important;
        }

        /* Fix for property grid */
        :global(.spg-container) {
          overflow: auto !important;
          max-height: 100% !important;
        }

        /* Fix for scrollbars */
        :global(*::-webkit-scrollbar) {
          width: 8px;
          height: 8px;
        }

        :global(*::-webkit-scrollbar-thumb) {
          background: #cdcdcd;
          border-radius: 4px;
        }

        :global(*::-webkit-scrollbar-track) {
          background: #f5f5f5;
        }

        :global(.svc-creator__content-wrapper) {
          height: 100px !important;
        }
        #creatorContainer {
          height: calc(100vh - 200px);
        }
        .config-section {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .config-section input {
          margin: 5px 0;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 300px;
        }
        .config-section label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        .action-button {
          margin: 10px 0;
          padding: 10px 20px;
          background-color: #1ab394;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }
        .action-button:hover {
          background-color: #18a689;
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
      `}</style>
    </div>
  );
};

export default InterviewCreator;
