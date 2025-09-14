"use client";
import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useSignupModal } from "../context/SignupModalContext";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { openSignupModal } = useSignupModal(); // Use the modal context

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? "bg-white shadow-lg" : "bg-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
        {/* Logo */}
        <div className="flex items-center space-x-8">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-500 rounded-full mr-2"></div>
            <span className="text-xl font-bold text-gray-900">HireFy</span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex space-x-6">
            <button
              onClick={() => (window.location.href = "/find-talent")}
              className="text-gray-700 hover:text-red-500 cursor-pointer"
            >
              Find Talent
            </button>
            <button
              onClick={() => (window.location.href = "/find-work")}
              className="text-gray-700 hover:text-red-500 cursor-pointer"
            >
              Find Work
            </button>
            <button className="text-gray-700 hover:text-red-500 cursor-pointer">
              Why HireFy
            </button>
          </div>
        </div>

        {/* Right Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={() => openSignupModal("login")}
            className="text-gray-700 hover:text-red-500 cursor-pointer"
          >
            Log in
          </button>
          <button
            onClick={() => openSignupModal("signup")}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium cursor-pointer"
          >
            Sign up
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Optional: Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <button
            onClick={() => (window.location.href = "/find-talent")}
            className="block w-full text-left px-4 py-2 text-gray-700 hover:text-red-500"
          >
            Find Talent
          </button>
          <button
            onClick={() => (window.location.href = "/find-work")}
            className="block w-full text-left px-4 py-2 text-gray-700 hover:text-red-500"
          >
            Find Work
          </button>
          <button
            
            className="block w-full text-left px-4 py-2 text-gray-700 hover:text-red-500"
          >
            Log in
          </button>
          <button
            onClick={() => openSignupModal("signup")}
            className="block w-full text-left px-4 py-2 text-white bg-red-500 hover:bg-red-600"
          >
            Sign up
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;