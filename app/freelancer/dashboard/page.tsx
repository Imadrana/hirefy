//This is the freelancer dashboard
"use client";

import React from "react";
import { useProfile } from "../../context/ProfileContext";
import { useRouter } from "next/navigation";

export default function FreelancerDashboard() {
  const { profile } = useProfile();

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