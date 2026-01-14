import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import { useNavigate } from "react-router-dom";

const videoConstraints = {
  width: { ideal: 1920 },
  height: { ideal: 1080 },
  facingMode: "user",
};

function CapturePage() {
  const webcamRef = useRef(null);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraStarted, setCameraStarted] = useState(false);

  const startCamera = async () => {
    if (containerRef.current.requestFullscreen) {
      await containerRef.current.requestFullscreen();
    } else if (containerRef.current.webkitRequestFullscreen) { 
      await containerRef.current.webkitRequestFullscreen();
    } else if (containerRef.current.msRequestFullscreen) {
      await containerRef.current.msRequestFullscreen();
    }
    setCameraStarted(true); // Only start webcam after fullscreen is active
  };

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImage(imageSrc);
  };

  const confirmCapture = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    localStorage.setItem('capturedImage', capturedImage);
    navigate('/tryon');
  };

  const retake = () => {
    setCapturedImage(null);
  };

  return (
    <div ref={containerRef} className="w-screen h-screen overflow-hidden flex flex-col items-center justify-center bg-black relative">
      {!cameraStarted ? (
        <>
          <button
            onClick={startCamera}
            className="px-10 py-4 bg-green-600 text-white rounded-full text-2xl font-bold hover:bg-green-700 transition"
          >
            Start Camera
          </button>
        </>
      ) : (
        <>
          {!capturedImage ? (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <button
                onClick={capture}
                className="absolute bottom-10 px-8 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 text-xl font-bold transition"
              >
                Capture
              </button>
            </>
          ) : (
            <>
              <img
                src={capturedImage}
                alt="Captured"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute bottom-10 flex space-x-6">
                <button
                  onClick={confirmCapture}
                  className="px-8 py-3 bg-black text-white rounded-full hover:bg-gray-800 text-xl font-bold transition"
                >
                  Looks Good?
                </button>
                <button
                  onClick={retake}
                  className="px-8 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 text-xl font-bold transition"
                >
                  Retake
                </button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default CapturePage;
