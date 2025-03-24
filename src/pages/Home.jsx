import React from "react"
import { Link } from "react-router-dom"
import { Card } from "../components/Card.jsx"
import { Button } from "../components/Button.jsx"

const Home = () => {
  return (
    <Card homePage className="sm:w-[50vw]" title="Sh. Printer">
      <div className="flex justify-between w-full gap-4 flex-col lg:flew-row">
        <Button className="w-full">
          <Link className="w-full" to="/login">
            Login
          </Link>
        </Button>
        <Button className="w-full">
          <Link to="/settings" className="w-full">
            Settings
          </Link>
        </Button>
        <Button className="w-full">
          <Link to="/logs" className="w-full">
            Logs
          </Link>
        </Button>
      </div>
    </Card>
  )
}

export default Home
