"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
const FreelancerProfile = () => {
  const [user, setUser] = useState({ name: "", email: "" });

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(storedUser);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold mb-6">Your Profile</h1>

      <div className="bg-white p-6 rounded-lg shadow max-w-md">
        <p className="mb-2"><span className="font-semibold">Name:</span> {user.name}</p>
        <p className="mb-2"><span className="font-semibold">Email:</span> {user.email}</p>
        <p className="mb-2"><span className="font-semibold">Role:</span> Freelancer</p>
        <button className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600">Edit Profile</button>
      </div>
    </div>
  );
};

export default FreelancerProfile;
