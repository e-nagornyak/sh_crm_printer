import React, { useEffect, useState } from 'react';
import { Card } from "../components/Card.jsx";
import { Button } from "../components/Button.jsx";
import { useNavigate } from "react-router-dom";
import useAppState from "../hooks/AppState.js";

const Login = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState('')
  const [isSaved, setIsSaved] = useState(false)
  const { setState } = useAppState();

  const getInitialToken = async () => {
    try {
      const baseConfig = await window.configAPI.getConfig()
      const initialToken = baseConfig?.token
      setValue(initialToken)
    } catch (e) {
      console.log(e)
    }
  }


  const handleSaveToken = async () => {
    try {
      setLoading(true)
      const baseConfig = await window.configAPI.getConfig()

      const updatedConfig = {
        ...baseConfig,
        token: value
      }

      await window.configAPI.saveConfig(updatedConfig)

      setIsSaved(true)
      setState('refreshing')

      setTimeout(() => {
        setIsSaved(false)
        navigate('/')
        navigate(0)
      }, 1000)
    } catch (e) {
      console.log(e)
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {
    getInitialToken()
  }, []);

  return (
    <Card title="Login">
    <div className="flex flex-col gap-2.5 items-start w-full">
    <label htmlFor="styled_input" className="text-white font-semibold text-base">
      Access Token
    </label>
    <div className="flex gap-2.5 items-center w-full">
    <input
      disabled={loading}
      value={value}
      onChange={e => setValue(e?.currentTarget?.value)}
      type="text"
      id="styled_input"
      className="px-4 py-2 w-full text-white font-semibold text-base bg-black rounded-md shadow-md hover:bg-gray-800 focus:bg-gray-900 focus:shadow-lg transition-all duration-300 focus:outline-none"
    />
    <Button className={`min-w-20 justify-center ${isSaved ? "bg-green-600" : ''}`} disabled={loading}
            onClick={handleSaveToken}>{isSaved ? "Saved" : "Save"}</Button>
    </div>
    </div>
    </Card>
  );
};

export default Login;
