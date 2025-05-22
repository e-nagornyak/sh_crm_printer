import axios from "axios"

const API_PATHS = {
  DELETE_TASK: (uuid) => `/queue-task/${uuid}`,
  MAIN_WS: "ws://37.27.179.208:8765",
  TEST_WS: "ws://37.27.179.208:4242",
}

const apiClient = axios.create({
  baseURL: "http://37.27.179.208:8025",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
})

const API = {
  deleteTask: async (uuid) => {
    try {
      const response = await apiClient.delete(API_PATHS.DELETE_TASK(uuid))
      return response.data
    } catch (error) {
      console.error("Failed to delete task:", error)
      throw error
    }
  },
}

export { API, API_PATHS }
