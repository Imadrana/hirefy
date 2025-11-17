// "use client" → This file runs in the browser.
"use client";

// Import React and useState (to use state/variables in the component).
import React, { useState } from "react";

// Import router (used to move between pages in Next.js).
import { useRouter } from "next/navigation";

// Import custom modal context (controls if signup modal is open or closed).
import { useSignupModal } from "../context/SignupModalContext";

// Start of component
const SignupLogin = () => {
  const router = useRouter(); // Router lets us go to another page.

  const [showLogin, setShowLogin] = useState(true); // true = login form, false = signup form.
  const [userType, setUserType] = useState("client"); // Can be "client" or "freelancer".
  const [form, setForm] = useState({ name: "", email: "", password: "" }); // Stores form input values.

  // When form is submitted
  const handleSubmit = (e) => {
    e.preventDefault(); // Stop page reload.
    console.log("Form submitted", form); // Print form values in console.

    // Save user info in localStorage (with role = freelancer).
    localStorage.setItem("user", JSON.stringify({ ...form, role: "freelancer" }));

    // After submit, go to freelancer home page.
    router.push("/freelancer/home");
  };

  const { isOpen, closeSignupModal } = useSignupModal(); // Get modal open/close info from context.

  if (!isOpen) return null; // If modal is closed, show nothing.

  // If modal is open, show the popup.
  return (
    // Dark background covering whole screen.
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* White box in the middle (the modal). */}
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        
        {/* Switch between Login and Signup buttons */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowLogin(true)} // Show login form.
            className={`${showLogin ? "font-bold" : "text-gray-500"} px-4 py-2`}
          >
            Login
          </button>
          <button
            onClick={() => setShowLogin(false)} // Show signup form.
            className={`${!showLogin ? "font-bold" : "text-gray-500"} px-4 py-2`}
          >
            Signup
          </button>
        </div>

        {/* Pick if you are Client or Freelancer */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setUserType("client")} // Choose client.
            className={`px-4 py-2 rounded-lg ${
              userType === "client" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Client
          </button>
          <button
            onClick={() => setUserType("freelancer")} // Choose freelancer.
            className={`px-4 py-2 rounded-lg ${
              userType === "freelancer" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"
            }`}
          >
            Freelancer
          </button>
        </div>

        {/* The form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Show full name only if it’s signup */}
          {!showLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={form.name} // Connected to form.name
                onChange={(e) => setForm({ ...form, name: e.target.value })} // Update name
                placeholder="Enter full name"
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>
          )}

          {/* Email input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email} // Connected to form.email
              onChange={(e) => setForm({ ...form, email: e.target.value })} // Update email
              placeholder="Enter email"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Password input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={form.password} // Connected to form.password
              onChange={(e) => setForm({ ...form, password: e.target.value })} // Update password
              placeholder="Enter password"
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          {/* Submit button - changes text depending on login or signup */}
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

// Export the component so it can be used in other files.
export default SignupLogin;
