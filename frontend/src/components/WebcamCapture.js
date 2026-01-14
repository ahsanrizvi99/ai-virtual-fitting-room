import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';

const WebcamCapture = () => {
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  };

  const videoConstraints = {
    width: 1280,   // Slightly balanced width
    height: 720,   // 16:9 ratio
    facingMode: "user"
  };

  return (
    <div className="relative w-full h-screen flex flex-col justify-center items-center bg-white">
      {!image ? (
        <>
          <div className="relative w-[70%] aspect-video shadow-lg rounded-xl overflow-hidden">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={videoConstraints}
            />
          </div>
          <button 
            onClick={capture} 
            className="absolute bottom-10 px-8 py-4 bg-blue-600 text-white text-lg rounded-full shadow-lg hover:bg-blue-700 transition">
            Capture Photo
          </button>
        </>
      ) : (
        <div className="relative w-[70%] aspect-video flex flex-col justify-center items-center shadow-lg rounded-xl overflow-hidden">
          <img 
            src={image} 
            alt="Captured" 
            className="w-full h-full object-cover" 
          />
          <button 
            onClick={() => setImage(null)}
            className="absolute bottom-10 px-8 py-4 bg-gray-700 text-white text-lg rounded-full shadow-lg hover:bg-gray-800 transition">
            Retake Photo
          </button>
        </div>
      )}
    </div>
  );
};

export default WebcamCapture;
