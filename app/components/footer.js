"use client"; // use the page to run on the browser side, not only server. make it able to use interactive features.

import React from "react"; 

const Footer = () => { //making a new component called footer. fx return code we want to show at the botton of the website.
  return ( //when use this component, this should appear on page.
    <footer className="bg-gray-900 text-white py-16 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-gray-400">© 2025 HireFy. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; //when another files wants to use this footer, it can import it as the default thing from this file.