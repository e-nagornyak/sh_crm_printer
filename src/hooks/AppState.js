import { useState, useEffect } from "react"
import { z } from "zod"

// Визначаємо можливі значення для стану через zod
const appStateSchema = z.enum(["online", "refreshing", "offline"])

// Хук для керування станом з використанням localStorage
const useAppState = () => {
  // Парсимо значення з localStorage або встановлюємо за замовчуванням 'offline'
  const [state, setState] = useState(() => {
    const savedState = localStorage.getItem("appState")
    try {
      return appStateSchema.parse(savedState || "offline")
    } catch (error) {
      console.error(
        'Invalid state in localStorage, defaulting to "offline".',
        error
      )
      return "offline"
    }
  })

  useEffect(() => {
    // Валідуємо перед збереженням у localStorage
    try {
      const validState = appStateSchema.parse(state)
      localStorage.setItem("appState", validState)
    } catch (error) {
      console.error("State validation failed", error)
    }
  }, [state])

  return { state, setState }
}

export default useAppState
