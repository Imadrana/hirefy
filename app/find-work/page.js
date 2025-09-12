"use client";

import { useState } from "react";
import { useSignupModal } from "../context/SignupModalContext";

export default function FindWorkPage() {
  const { openSignupModal } = useSignupModal();
  const [searchTerm, setSearchTerm] = useState("");
  const works = [
    { id: 1, title: "Website Redesign", client: "TechCorp", location: "Remote", budget: 1200 },
    { id: 2, title: "Mobile App UI/UX", client: "Appify", location: "Remote", budget: 900 },
  ];

  const handleApply = (workId) => {
    openSignupModal(); // Opens global signup modal
   
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-16">
      <h1 className="text-4xl font-bold mb-8 text-center">Find Work</h1>

      <div className="max-w-4xl mx-auto flex gap-2 mb-8">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search projects..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button className="bg-red-500 text-white px-6 rounded-lg">Search</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {works
          .filter(w => w.title.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(work => (
            <div key={work.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
              <h2 className="text-xl font-semibold">{work.title}</h2>
              <p>Client: {work.client}</p>
              <p>Location: {work.location}</p>
              <p>Budget: ${work.budget}</p>
              <button
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                onClick={() => handleApply(work.id)}
              >
                Apply
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}