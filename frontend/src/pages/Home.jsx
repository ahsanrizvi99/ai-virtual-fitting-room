import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Home() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/background.jpg')",
      }}
    >
      {/* Frosted Glass Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="backdrop-blur-sm bg-white/30 border border-white/20 rounded-3xl p-10 flex flex-col items-center shadow-lg"
      >
        {/* Title */}
        <h1 className="text-5xl font-serif font-bold text-black mb-6 text-center tracking-wide">
          VIRTUAL FIT
        </h1>

        {/* Subtext */}
        <p className="text-lg text-gray-800 mb-10 text-center font-medium">
          Your AI-Powered Virtual Dressing Room
        </p>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8">
          {/* Browse Clothes Button */}
          <Link
            to="/gallery"
            className="px-8 py-4 bg-white text-black font-semibold rounded-full shadow-md hover:scale-105 transition transform"
          >
            Browse Clothes
          </Link>

          {/* Divider */}
          <div className="hidden md:block h-16 border-l-2 border-gray-300"></div>

          {/* Browse Models Button */}
          <Link
            to="/models"
            className="px-8 py-4 bg-black text-white font-semibold rounded-full shadow-md hover:scale-105 transition transform"
          >
            Browse Models
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default Home;
