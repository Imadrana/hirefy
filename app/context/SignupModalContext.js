"use client";

import { createContext, useContext, useState } from "react";

const SignupModalContext = createContext();

export const SignupModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openSignupModal = () => setIsOpen(true);
  const closeSignupModal = () => setIsOpen(false);

  return (
    <SignupModalContext.Provider value={{ isOpen, openSignupModal, closeSignupModal }}>
      {children}
    </SignupModalContext.Provider>
  );
};

export const useSignupModal = () => useContext(SignupModalContext);
