"use client";

import React from "react"; //we import React by writing import React from "react";
import { useProfile } from "../../context/ProfileContext"; //gives us the freelancer’s saved profile information, like name, email, skills, and bio.
import { useRouter } from "next/navigation";//tool for moving between pages.

export default function FreelancerDashboard() { //making a component called FreelancerDashboard, and it is the default export of this file. So other files can easily use it.
  const { profile } = useProfile(); //Get the profile object from the ProfileContext.

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Freelancer Dashboard</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-2xl font-semibold">{profile.name}</h2>
        <p className="text-gray-600">{profile.email}</p>
        <p className="text-gray-600">{profile.skills}</p>
        <p className="text-gray-700 mt-2">{profile.bio}</p>
      </div>
    </div>
  );
}