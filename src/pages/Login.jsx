import React from 'react';
import { Card } from "../components/Card.jsx";
import { Button } from "../components/Button.jsx";

const Login = () => {

  return (
    <Card title="Login">
    <div className="flex flex-col gap-2.5 items-start w-full">
    <label htmlFor="styled_input" className="text-white font-semibold text-base">
      Access Token
    </label>
    <div className="flex gap-2.5 items-center w-full">
      <input
        type="text"
        id="styled_input"
        className="px-4 py-2 w-full text-white font-semibold text-base bg-black rounded-md shadow-md hover:bg-gray-800 focus:bg-gray-900 focus:shadow-lg transition-all duration-300 focus:outline-none"
      />
      <Button>Save</Button>
    </div>
    </div>
    </Card>
  );
};

export default Login;
