import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthContext } from "./pages/authentication/AuthProvider";

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { currentAgent } = useContext(AuthContext);

  return (
    <>
      <Route
        {...rest}
        render={(props) =>
          currentAgent ? (
            <Component key={props.location.key} {...props} />
          ) : (
            <Redirect to="/login" />
          )
        }
      />
    </>
  );
};

export default PrivateRoute;
