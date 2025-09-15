"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "../../context/ProfileContext";

export default function FreelancerHome() {
  const router = useRouter();
  const { setProfile } = useProfile();
  const [form, setForm] = useState({ name: "", email: "", skills: "", bio: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(form); // Save data in context
    router.push("/freelancer/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-6">Create Your Freelancer Profile</h1>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4 bg-white p-6 rounded-lg shadow">
        <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Full Name" className="w-full px-3 py-2 border rounded-lg" required />
        <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full px-3 py-2 border rounded-lg" required />
        <input type="text" name="skills" value={form.skills} onChange={handleChange} placeholder="Skills" className="w-full px-3 py-2 border rounded-lg" />
        <textarea name="bio" value={form.bio} onChange={handleChange} placeholder="Bio" className="w-full px-3 py-2 border rounded-lg" />
        <button type="submit" className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600">Save Profile</button>
      </form>
    </div>
  );
}
