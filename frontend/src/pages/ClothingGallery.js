import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function ClothingGallery() {
  const [clothes, setClothes] = useState([]);
  const [filterColor, setFilterColor] = useState("");
  const [filterStyle, setFilterStyle] = useState("");
  const [filterSleeve, setFilterSleeve] = useState("");
  const [filterSeason, setFilterSeason] = useState("");
  const navigate = useNavigate();

  // State to manage the pop-up modal visibility
  const [selectedCloth, setSelectedCloth] = useState(null);

  useEffect(() => {
    fetch('/metadata.json')
      .then(response => response.json())
      .then(data => setClothes(data))
      .catch(error => console.error('Error loading metadata:', error));
  }, []);

  const filteredClothes = clothes.filter(cloth => {
    return (
      (!filterColor || cloth.color === filterColor) &&
      (!filterStyle || cloth.style === filterStyle) &&
      (!filterSleeve || cloth.sleeve_length === filterSleeve) &&
      (!filterSeason || cloth.season === filterSeason)
    );
  });

  // This function now opens the modal
  const handleClothClick = (cloth) => {
    setSelectedCloth(cloth);
  };

  // This function closes the modal
  const handleCloseModal = () => {
    setSelectedCloth(null);
  };

  // This function saves the choice and navigates to the next step
  const handleLooksGood = () => {
    localStorage.setItem('selectedCloth', JSON.stringify(selectedCloth));
    navigate("/models");
  };

  const getUniqueOptions = (key) => {
    if (!clothes.length) return [];
    return [...new Set(clothes.map(item => item[key]))].sort();
  };

  return (
    <div
      className="min-h-screen p-8"
      style={{
        background: 'radial-gradient(circle at center, #fdf6e3 0%, #f5f3ef 60%, #f5f3ef 100%)',
      }}
    >
      <h1 className="text-4xl font-semibold mb-8 text-center text-gray-800 tracking-wider">
        Clothing Gallery
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-4 mb-10">
        <select onChange={(e) => setFilterColor(e.target.value)} className="border border-gray-300 p-3 rounded-lg shadow-sm bg-white text-gray-700 capitalize">
          <option value="">All Colors</option>
          {getUniqueOptions("color").map((option, idx) => <option key={idx} value={option}>{option}</option>)}
        </select>
        <select onChange={(e) => setFilterStyle(e.target.value)} className="border border-gray-300 p-3 rounded-lg shadow-sm bg-white text-gray-700 capitalize">
          <option value="">All Styles</option>
          {getUniqueOptions("style").map((option, idx) => <option key={idx} value={option}>{option}</option>)}
        </select>
        <select onChange={(e) => setFilterSleeve(e.target.value)} className="border border-gray-300 p-3 rounded-lg shadow-sm bg-white text-gray-700 capitalize">
          <option value="">All Sleeve Lengths</option>
          {getUniqueOptions("sleeve_length").map((option, idx) => <option key={idx} value={option}>{option}</option>)}
        </select>
        <select onChange={(e) => setFilterSeason(e.target.value)} className="border border-gray-300 p-3 rounded-lg shadow-sm bg-white text-gray-700 capitalize">
          <option value="">All Seasons</option>
          {getUniqueOptions("season").map((option, idx) => <option key={idx} value={option}>{option}</option>)}
        </select>
      </div>

      {/* Gallery */}
      <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8" layout>
        <AnimatePresence>
          {filteredClothes.map((cloth) => (
            <motion.div
              key={cloth.filename}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl p-4 flex flex-col items-center hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
              onClick={() => handleClothClick(cloth)}
            >
              <img
                src={`/clothes/${cloth.filename}`}
                alt={cloth.type}
                className="w-full h-64 object-contain rounded-2xl mb-4"
              />
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-800 capitalize">{cloth.style} {cloth.type}</p>
                <p className="text-gray-500 capitalize">{cloth.color}</p>
                <p className="text-gray-500 capitalize">{cloth.sleeve_length}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Modal / Overlay - Re-added from your old code */}
      <AnimatePresence>
        {selectedCloth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
            onClick={handleCloseModal} // Close modal on background click
          >
            {/* FIX: Added font-serif to match the style from Home.jsx */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="bg-[#fefcf7] rounded-lg shadow-xl flex flex-col md:flex-row items-center p-8 space-y-6 md:space-y-0 md:space-x-10 font-serif"
              style={{ width: '90%', maxWidth: '800px' }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
              <div className="flex-shrink-0">
                <img
                  src={`/clothes/${selectedCloth.filename}`}
                  alt={selectedCloth.type}
                  className="w-[300px] h-auto object-contain rounded-md shadow-md"
                />
              </div>

              <div className="flex flex-col justify-center items-start space-y-6 w-full">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2 capitalize">{selectedCloth.style} {selectedCloth.type}</h2>
                  <p className="text-lg text-gray-700 capitalize mb-1">Color: {selectedCloth.color}</p>
                  <p className="text-lg text-gray-700 capitalize">Sleeve: {selectedCloth.sleeve_length}</p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleLooksGood}
                    className="px-8 py-3 bg-black text-white rounded-full font-semibold tracking-wide hover:bg-gray-800 transition"
                  >
                    Looks Good
                  </button>
                  <button
                    onClick={handleCloseModal}
                    className="px-8 py-3 border-2 border-black text-black rounded-full font-semibold tracking-wide hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ClothingGallery;
