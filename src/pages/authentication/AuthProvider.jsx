import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null); // null represents the initial loading state
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Simulate an asynchronous check for authentication
    const checkAuthStatus = () => {
      setLoading(true);
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      if (token && user) {
        setCurrentUser(user);
      }
      setLoading(false);
      // Update the authentication status based on the presence of a token
    };

    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      {loading ? (
        <div>Loading...</div> // Render a loader while checking authentication status
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};
