"use client";

import React from "react";
import { Award, Zap, Shield } from "lucide-react";

const WhyHireFy = () => {
  const features = [
    { icon: <Award className="w-12 h-12 text-red-500 mx-auto mb-4" />, title: "Quality Work", description: "HireFy connects you with trusted professionals to get quality work done." },
    { icon: <Zap className="w-12 h-12 text-blue-500 mx-auto mb-4" />, title: "No Cost Until You Hire", description: "You pay nothing until you hire someone." },
    { icon: <Shield className="w-12 h-12 text-green-500 mx-auto mb-4" />, title: "Safe & Secure", description: "Your projects and payments are secure with HireFy." }
  ];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-16">
      <h1 className="text-4xl font-bold mb-12 text-center">Why HireFy</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-center">
        {features.map((f, idx) => (
          <div key={idx} className="bg-white rounded-lg p-8 hover:shadow-lg transition cursor-pointer">
            {f.icon}
            <h3 className="text-xl font-semibold mb-4">{f.title}</h3>
            <p>{f.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhyHireFy;