import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-black text-white flex justify-between items-center px-8 py-4">
      {/* Left: VirtualFIT Logo */}
      <Link to="/" className="text-xl font-bold tracking-wider">
        VirtualFIT
      </Link>

      {/* Center: Navigation Links */}
      <div className="flex space-x-10 text-sm uppercase font-semibold tracking-widest">
        <Link to="/" className="hover:underline hover:underline-offset-8">
          Home
        </Link>
        <Link to="/gallery" className="hover:underline hover:underline-offset-8">
          Gallery
        </Link>
        <Link to="/models" className="hover:underline hover:underline-offset-8">
          Models
        </Link>
        <Link to="/tryon" className="hover:underline hover:underline-offset-8">
          Try On
        </Link>
      </div>

      {/* Right: Empty for now */}
      <div className="w-8"></div>
    </nav>
  );
}

export default Navbar;
