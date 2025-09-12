"use client";

import { useState } from "react";
import { useSignupModal } from "../context/SignupModalContext";

export default function FindTalentPage() {
  const { openSignupModal } = useSignupModal();
  const [searchTerm, setSearchTerm] = useState("");
  const talents = [
    { id: 1, name: "Sam Buckley", skill: "Web Developer", location: "Remote" },
    { id: 2, name: "Pery Crockett", skill: "Web Designer", location: "Remote" },
    { id: 3, name: "Hendry Linder", skill: "Digital Marketing", location: "Remote" },
  ];

  const handleContact = (talentId) => {
    openSignupModal(); // Opens global signup modal
    
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-16">
      <h1 className="text-4xl font-bold mb-8 text-center">Find Talent</h1>

      <div className="max-w-4xl mx-auto flex gap-2 mb-8">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search talent..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button className="bg-red-500 text-white px-6 rounded-lg">Search</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {talents
          .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(talent => (
            <div key={talent.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
              <h2 className="text-xl font-semibold">{talent.name}</h2>
              <p>Skill: {talent.skill}</p>
              <p>Location: {talent.location}</p>
              <button
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                onClick={() => handleContact(talent.id)}
              >
                Contact
              </button>
            </div>
          ))}
      </div>
    </div>
  );
}