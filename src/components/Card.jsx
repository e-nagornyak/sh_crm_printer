import React from 'react';
import { BackButton } from "./BackButton.jsx";

export function Card({ children, homePage, title }) {
  return (
    <div
      className={`w-full sm:w-[50vw] flex flex-col gap-6 transition-all duration-500 hover:shadow-2xl hover:border-gray-200 text-white border border-gray-500 m-4 p-6 rounded-lg shadow-xl bg-[#232325] items-center justify-start`}>
      <div className="flex items-center justify-between w-full">
        {!homePage && <BackButton/>}
        <h1 className="flexible-text-8 c-text-shadow-md">{title}</h1>
      </div>
      {children}
    </div>
  )
}

