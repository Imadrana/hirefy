// "use client" → This runs in the browser (not on the server).
"use client";

import React from "react"; // Bring in React so we can write JSX (HTML in JS).
import { X } from "lucide-react"; // Bring in the "X" close icon from a library.

// Modal component → takes 3 things (show, onClose, children).
const Modal = ({ show, onClose, children }) => {
  if (!show) return null; // If show = false → show nothing.

  return (
    // Black background that covers the whole screen.
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      
      {/* White box in the middle of the screen (the modal). */}
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative max-h-[90vh] overflow-y-auto">
        
        {/* Button in top-right corner to close the modal. */}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" /> {/* The "X" icon inside the button. */}
        </button>

        {children} {/* Whatever content we put inside Modal will show here. */}
      </div>
    </div>
  );
};

export default Modal; // Makes Modal usable in other files.
