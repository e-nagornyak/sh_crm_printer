import React from 'react';

export function Button({ className, ...props }) {

  return (
    <button
      className={"px-4 flex items-center gap-2 py-2 text-white font-semibold text-base bg-black rounded-md shadow-md hover:bg-gray-800" +
        " hover:shadow-lg hover:-translate-y-1 active:bg-gray-900 active:shadow-sm active:translate-y-1 transition-all duration-300" +
        " focus:outline-none " +className}
      {...props}
   />
  )
}

