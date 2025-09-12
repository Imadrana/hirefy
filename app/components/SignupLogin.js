"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignupModal } from "../context/SignupModalContext";
const SignupLogin = () => {
     const router = useRouter();
  const [showLogin, setShowLogin] = useState(true);
  const [userType, setUserType] = useState("client"); // "client" or "freelancer"
  const [form, setForm] = useState({ name: "", email: "", password: "" });

 const handleSubmit = (e) => {
  e.preventDefault();
  console.log("Form submitted", form);
  

  // You can store the user info in a context or localStorage
  localStorage.setItem("user", JSON.stringify({ ...form, role: "freelancer" }));

  // Redirect to freelancer home page
  router.push("/freelancer/home");
  };
   const { isOpen, closeSignupModal } = useSignupModal();
 if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        {/* Toggle Login/Signup */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowLogin(true)}
            className={`${showLogin ? "font-bold" : "text-gray-500"} px-4 py-2`}
          >
            Login
          </button>
          <button
            onClick={() => setShowLogin(false)}
            className={`${!showLogin ? "font-bold" : "text-gray-500"} px-4 py-2`}
          >
            Signup
          </button>
        </div>

        {/* Choose User Type */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setUserType("client")}
            className={`px-4 py-2 rounded-lg ${
              userType === "client" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Client
          </button>
          <button
            onClick={() => setUserType("freelancer")}
            className={`px-4 py-2 rounded-lg ${
              userType === "freelancer" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Freelancer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!showLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter full name"
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Enter email"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter password"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          >
            {showLogin ? `Login as ${userType}` : `Signup as ${userType}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupLogin;