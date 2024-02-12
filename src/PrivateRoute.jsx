import React, { useContext } from "react";
import { Route, Redirect } from "react-router-dom";
import { AuthContext } from "./pages/authentication/AuthProvider";

const PrivateRoute = ({ component: Component, ...rest }) => {
  const { currentUser } = useContext(AuthContext);

  return (
    <>
      <Route
        {...rest}
        render={(props) =>
          currentUser ? (
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
