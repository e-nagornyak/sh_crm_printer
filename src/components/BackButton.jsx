import React from "react"
import { useNavigate } from "react-router-dom"

export function BackButton({ href }) {
  const navigate = useNavigate()

  const onClickBack = () => {
    navigate(href || "/")
  }

  return (
    <button
      onClick={onClickBack}
      className="px-4 flex items-center gap-2 py-2 text-white font-semibold text-base bg-black rounded-md shadow-md hover:bg-gray-800 hover:shadow-lg hover:-translate-y-1 active:bg-gray-900 active:shadow-sm active:translate-y-1 transition-all duration-300 focus:outline-none"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="feather feather-arrow-left"
      >
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
      Back
    </button>
  )
}
