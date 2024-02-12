import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { AuthProvider } from "./pages/authentication/AuthProvider";
import Login from "./pages/authentication/Login";
import Home from "./pages/home/Home";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <Route exact path="/login" component={Login} />
          <PrivateRoute exact path="/home" component={Home} />
          <PrivateRoute path="/*">
            <Redirect to="/home" />
          </PrivateRoute>
        </Switch>
      </Router>
    </AuthProvider>
  );
};

export default App;
