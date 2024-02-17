import axios from "axios";
import React, { createContext, useState, useEffect } from "react";
import config from "../../environments/config";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentAgent, setCurrentAgent] = useState(null); // null represents the initial loading state
  const [fbUser, setFBUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const getConnectedFBPageData = async () => {
    try {
      let { data } = await axios.get(config.API_URL + "fb/data");
      setFBUser(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    // Simulate an asynchronous check for authentication
    const checkAuthStatus = async () => {
      setLoading(true);
      const { data: user } = await axios.get(config.API_URL + "auth/verify");
      if (user) {
        setCurrentAgent(user);
        getConnectedFBPageData();
      }
      setLoading(false);
      // Update the authentication status based on the presence of a token
    };

    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{ currentAgent, setCurrentAgent, fbUser, setFBUser }}
    >
      {loading ? (
        <div>Loading...</div> // Render a loader while checking authentication status
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
