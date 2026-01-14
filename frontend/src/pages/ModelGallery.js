import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Webcam from "react-webcam";

function ModelGallery() {
  const [models, setModels] = useState([]);
  const [filterSkinTone, setFilterSkinTone] = useState("");
  const [selectedModel, setSelectedModel] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [loading, setLoading] = useState(false);
  // FIX: New state to hold the webcam capture and match result
  const [capturedImage, setCapturedImage] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const navigate = useNavigate();
  const webcamRef = useRef(null);

  useEffect(() => {
    fetch('/models.json')
      .then(response => response.json())
      .then(data => setModels(data))
      .catch(error => console.error('Error loading models metadata:', error));
  }, []);

  const handleModelClick = (model) => setSelectedModel(model);
  const handleCloseModal = () => setSelectedModel(null);
  const handleLooksGood = () => {
    localStorage.setItem('selectedModel', JSON.stringify(selectedModel));
    navigate("/tryon");
  };
  
  const resetWebcamState = () => {
    setShowWebcam(false);
    setLoading(false);
    setCapturedImage(null);
    setMatchResult(null);
  };

  const captureAndMatch = async () => {
    setLoading(true);
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      alert("Could not capture image. Please try again.");
      setLoading(false);
      return;
    }
    setCapturedImage(imageSrc);
    
    try {
        const response = await fetch('http://localhost:8000/match-skin-tone/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_base64: imageSrc }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || "Failed to match skin tone.");
        }
        const data = await response.json();
        setMatchResult(data); // Store the result object
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    } finally {
        setLoading(false);
    }
  };
  
  // FIX: New function to apply the filter and close the modal
  const applyFilterAndClose = () => {
    if (matchResult) {
      setFilterSkinTone(matchResult.best_match_tone);
    }
    resetWebcamState();
  };

  const filteredModels = models.filter(model => !filterSkinTone || model.skin_tone === filterSkinTone);
  const skinToneOrder = ["Very Fair", "Fair", "Light Brown", "Medium Brown", "Dark Brown", "Deep Dark"];
  const uniqueSkinTones = skinToneOrder.filter(tone => models.some(model => model.skin_tone === tone));

  return (
    <div className="min-h-screen p-8" style={{ background: 'radial-gradient(circle at center, #fdf6e3 0%, #f5f3ef 60%, #f5f3ef 100%)' }}>
      <h1 className="text-4xl font-semibold mb-8 text-center text-gray-800 tracking-wider">Choose a Model</h1>

      {/* Filters and Match Button */}
      <div className="flex justify-center items-center gap-4 mb-10">
        <select onChange={(e) => setFilterSkinTone(e.target.value)} value={filterSkinTone} className="border border-gray-300 p-3 rounded-lg shadow-sm bg-white text-gray-700 capitalize">
          <option value="">All Skin Tones</option>
          {uniqueSkinTones.map((tone, idx) => <option key={idx} value={tone}>{tone}</option>)}
        </select>
        <button onClick={() => setShowWebcam(true)} className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-full shadow-lg hover:scale-105 transition transform">
          Match My Skin Tone ✨
        </button>
      </div>

      {/* Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {filteredModels.map((model) => (
          <div key={model.id} className="bg-white rounded-3xl p-4 flex flex-col items-center hover:shadow-2xl transition-shadow duration-300 cursor-pointer" onClick={() => handleModelClick(model)}>
            <img src={`/models/${model.filename}`} alt={`Model ${model.id}`} className="w-full h-96 object-contain rounded-2xl mb-4" />
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800 capitalize">Model {model.id.split('_')[0]}</p>
              <p className="text-gray-500 capitalize">{model.skin_tone} Tone</p>
            </div>
          </div>
        ))}
      </div>

      {/* Model Selection Modal */}
      <AnimatePresence>
        {selectedModel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50" onClick={handleCloseModal}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="bg-[#fefcf7] rounded-lg shadow-xl flex flex-col md:flex-row items-center p-8 gap-10" style={{ width: '90%', maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
              <img src={`/models/${selectedModel.filename}`} alt={`Model ${selectedModel.id}`} className="w-[300px] h-auto object-contain rounded-md shadow-md" />
              <div className="flex flex-col justify-center items-start space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Model {selectedModel.id.split('_')[0]}</h2>
                  <p className="text-lg text-gray-700 capitalize">Skin Tone: {selectedModel.skin_tone}</p>
                </div>
                <div className="flex space-x-4">
                  <button onClick={handleLooksGood} className="px-8 py-3 bg-black text-white rounded-full font-semibold tracking-wide hover:bg-gray-800 transition">
                    Looks Good
                  </button>
                  <button onClick={handleCloseModal} className="px-8 py-3 border-2 border-black text-black rounded-full font-semibold tracking-wide hover:bg-gray-100 transition">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Webcam Modal for Skin Tone Matching */}
      <AnimatePresence>
        {showWebcam && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="bg-white p-8 rounded-lg shadow-lg flex flex-col items-center gap-6 w-auto">
              
              {/* FIX: Conditionally render Webcam or Result View */}
              {!matchResult ? (
                <>
                  <h3 className="text-2xl font-semibold">Position Your Face in the Frame</h3>
                  <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width={640} height={480} className="rounded-md" />
                  <div className="flex gap-4">
                    <button onClick={captureAndMatch} disabled={loading} className="px-6 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition disabled:bg-gray-400 text-lg">
                      {loading ? "Analyzing..." : "Capture & Match"}
                    </button>
                    <button onClick={resetWebcamState} className="px-6 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition text-lg">
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-semibold">Analysis Complete!</h3>
                  <div className="flex gap-4 items-center">
                    <img src={capturedImage} alt="Your Capture" className="w-60 h-auto rounded-md shadow-md" />
                    <div>
                      <p className="text-lg">We've detected a</p>
                      <p className="text-3xl font-bold text-purple-600">{matchResult.best_match_tone}</p>
                      <p className="text-lg">skin tone.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <button onClick={applyFilterAndClose} className="px-6 py-3 bg-blue-500 text-white rounded-full font-semibold hover:bg-blue-600 transition text-lg">
                      Filter by {matchResult.best_match_tone}
                    </button>
                     <button onClick={() => setMatchResult(null)} className="px-6 py-3 border-2 border-black text-black rounded-full font-semibold hover:bg-gray-100 transition text-lg">
                      Try Again
                    </button>
                  </div>
                </>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ModelGallery;
