"use client";

import React, { useState } from "react";
import { Search, Menu, X, ChevronRight, ChevronLeft, Star, Users, Shield, Zap, Globe, Award, Mail, Lock, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSignupModal } from '../context/SignupModalContext';

const HirefyLanding = () => {
  const router = useRouter();
  const { openSignupModal } = useSignupModal(); // Use modal context
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
const [showSignupLogin, setShowSignupLogin] = useState(false);

  const skillCategories = [
    { title: "User experience designers", image: "/api/placeholder/280/200", color: "bg-blue-500" },
    { title: "User interface designers", image: "/api/placeholder/280/200", color: "bg-gray-800" },
    { title: "Graphics designer", image: "/api/placeholder/280/200", color: "bg-pink-400" },
    { title: "Animator", image: "/api/placeholder/280/200", color: "bg-orange-600" },
  ];

  const testimonials = [
    { name: "Sam Buckley", role: "Web Developer", text: "I code fast, clean, and responsive.", avatar: "/api/placeholder/60/60" },
    { name: "Pery Crockett", role: "Web Designer", text: "I design clean, modern websites that reflect your brand.", avatar: "/api/placeholder/60/60" },
    { name: "Hendry Linder", role: "Digital Marketing", text: "I help brands grow through smart digital strategies.", avatar: "/api/placeholder/60/60" },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % skillCategories.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + skillCategories.length) % skillCategories.length);

  const handleButtonClick = (action) => {
    switch (action) {
      case "Find Talent":
        router.push("/find-talent");
        break;
      case "Find Work":
        router.push("/find-work");
        break;
      case "Why HireFy":
        router.push("/why-hirefy"); // Adjust if needed
        break;
      case "login":
        openSignupModal("login");
        break;
      case "signup":
        openSignupModal("signup");
        break;
      default:
        console.log("Button clicked:", action);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-500 rounded-full mr-2"></div>
                <span className="text-xl font-bold text-gray-900">HireFy</span>
              </div>
              <div className="hidden md:flex space-x-6">
                <button onClick={() => handleButtonClick("Find Talent")} className="text-gray-700 hover:text-red-500 transition-colors cursor-pointer">Find Talent</button>
                <button onClick={() => handleButtonClick("Find Work")} className="text-gray-700 hover:text-red-500 transition-colors cursor-pointer">Find Work</button>
                <button onClick={() => handleButtonClick("Why HireFy")} className="text-gray-700 hover:text-red-500 transition-colors cursor-pointer">Why HireFy</button>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <button onClick={() => handleButtonClick("login")} className="text-gray-700 hover:text-red-500 cursor-pointer">Log in</button>
              <button onClick={() => handleButtonClick("signup")} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium cursor-pointer">Sign up</button>
            </div>
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-red-500 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex items-center">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">Join world's best marketplace</h1>
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl">Find the best Talent and best works based on your skills from around the world.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => handleButtonClick("signup")} className="bg-white text-red-500 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">Find Talent</button>
              <button onClick={() => handleButtonClick("signup")} className="border-2 border-white hover:bg-white hover:text-red-500 px-8 py-3 rounded-lg font-semibold">Find Work</button>
            </div>
          </div>
        </div>
      </section>

      {/* Top Skills Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">Top skills categories</h2>
          <div className="relative flex justify-center">
            <button onClick={prevSlide} className="absolute left-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50">
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {skillCategories.map((category, idx) => (
                <div key={idx} className={`${category.color} rounded-lg p-6 text-white hover:scale-105 cursor-pointer`} onClick={() => handleButtonClick(category.title)}>
                  <div className="h-32 bg-white/20 rounded-lg mb-4 flex items-center justify-center">
                    <img src={category.image} alt={category.title} className="w-full h-full object-cover rounded-lg" />
                  </div>
                  <h3 className="font-semibold text-lg">{category.title}</h3>
                </div>
              ))}
            </div>
            <button onClick={nextSlide} className="absolute right-0 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50">
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">People talk about us</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-lg p-6 shadow-lg hover:shadow-xl cursor-pointer">
                <p className="text-gray-700 mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <h4 className="font-semibold text-gray-900">{t.name}</h4>
                    <p className="text-gray-500 text-sm">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HirefyLanding;
