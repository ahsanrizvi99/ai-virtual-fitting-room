import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import TryOnPage from "./pages/TryOnPage";
import ClothingGallery from "./pages/ClothingGallery";
import ModelGallery from "./pages/ModelGallery"; // Import the new component

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

function MainLayout() {
  const location = useLocation();
  
  // You can add more paths here if you want to hide the navbar on other pages
  const hideNavbar = location.pathname === "/capture"; // Keeping this logic for now

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNavbar && <Navbar />}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<ClothingGallery />} />
          <Route path="/models" element={<ModelGallery />} /> {/* Add the new route */}
          <Route path="/tryon" element={<TryOnPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
