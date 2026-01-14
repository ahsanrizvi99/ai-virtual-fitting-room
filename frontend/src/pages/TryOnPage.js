import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

function TryOnPage() {
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedCloth, setSelectedCloth] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const model = JSON.parse(localStorage.getItem('selectedModel'));
    const cloth = JSON.parse(localStorage.getItem('selectedCloth'));
    setSelectedModel(model);
    setSelectedCloth(cloth);
  }, []);

  const handleTryOn = async () => {
    if (!selectedModel || !selectedCloth) {
      alert("Please select a model and a cloth first.");
      return;
    }
    
    setLoading(true);
    setShowResult(false);

    try {
      // --- IMPORTANT CHANGE ---
      // This now points to your local backend server running on port 8000.
      // Your local server will then forward the request to Colab.
      const backendUrl = 'http://localhost:8000/virtual-try-on/';
      
      const formData = new FormData();
      
      const modelResponse = await fetch(`/models/${selectedModel.filename}`);
      const modelBlob = await modelResponse.blob();
      formData.append('person_image', modelBlob, selectedModel.filename);
      
      const clothResponse = await fetch(`/clothes/${selectedCloth.filename}`);
      const clothBlob = await clothResponse.blob();
      formData.append('cloth_image', clothBlob, selectedCloth.filename);

      const response = await fetch(backendUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate try-on image.");
      }

      const imageBlob = await response.blob();
      const imageUrl = URL.createObjectURL(imageBlob);
      
      setResultImage(imageUrl);
      setShowResult(true);

    } catch (error) {
      console.error('Try-on error:', error);
      alert(`Error generating try-on: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setResultImage(null);
  };

  if (!selectedModel || !selectedCloth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fefcf7]">
        <p className="text-2xl text-gray-600">Please select a cloth and a model first.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fefcf7] font-serif p-8">
      {/* Display the selected model and cloth side-by-side */}
      <div className="flex flex-col md:flex-row items-center bg-white rounded-3xl shadow-xl p-8 space-y-10 md:space-y-0 md:space-x-10">
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-2">Your Model</h3>
          <img 
            src={`/models/${selectedModel.filename}`} 
            alt="Selected Model" 
            className="w-[300px] h-[400px] object-contain rounded-lg shadow-md" 
          />
        </div>
        <div className="flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-2">Your Garment</h3>
          <img 
            src={`/clothes/${selectedCloth.filename}`} 
            alt={selectedCloth.type} 
            className="w-[300px] h-[400px] object-contain rounded-lg shadow-md" 
          />
        </div>
      </div>
      
      {/* The main "Try it on!" button */}
      <button
        onClick={handleTryOn}
        disabled={loading}
        className="mt-10 px-8 py-4 bg-black text-white rounded-full text-xl hover:bg-gray-800 transition disabled:bg-gray-500"
      >
        {loading ? (
          <span className="flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : "Try it on!"}
      </button>

      {/* Pop-up modal to show the final result */}
      <AnimatePresence>
        {showResult && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" 
            onClick={handleCloseResult}
          >
            <motion.div 
              initial={{ scale: 0.8 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.8 }} 
              className="bg-[#fefcf7] rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 max-w-[90vw]" 
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold text-center">Your Virtual Try-On Result</h2>
              <img 
                src={resultImage} 
                alt="Try-On Result" 
                className="max-w-full max-h-[70vh] object-contain rounded-md" 
              />
              <div className="flex gap-4">
                <button 
                  onClick={handleCloseResult} 
                  className="px-6 py-2 bg-black text-white rounded-full font-semibold"
                >
                  Close
                </button>
                <button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = resultImage;
                    link.download = 'virtual-tryon-result.jpg';
                    link.click();
                  }} 
                  className="px-6 py-2 bg-blue-600 text-white rounded-full font-semibold"
                >
                  Download
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TryOnPage;