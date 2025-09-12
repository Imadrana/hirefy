"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";

interface Profile {
  name: string;
  email: string;
  skills: string;
  bio: string;
}

interface ProfileContextType {
  profile: Profile;
  setProfile: (profile: Profile) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile>({ name: "", email: "", skills: "", bio: "" });

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error("useProfile must be used within ProfileProvider");
  return context;
};
