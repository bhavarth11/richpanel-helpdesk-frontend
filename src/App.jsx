import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { AuthProvider } from "./pages/authentication/AuthProvider";
import Home from "./pages/home/Home";
import Login from "./pages/authentication/Login";
import Connect from "./pages/home/Connect";
import Register from "./pages/authentication/Register";
import { MuiThemeProvider, createTheme } from "@material-ui/core";

const theme = createTheme({
  palette: {
    primary: {
      // light: will be calculated from palette.primary.main,
      main: "#004E97",
      // dark: will be calculated from palette.primary.main,
      // contrastText: will be calculated to contrast with palette.primary.main
    },
    secondary: {
      main: "#f44336",
    },
  },
});

const App = () => {
  return (
    <AuthProvider>
      <MuiThemeProvider theme={theme}>
        <Router>
          <Switch>
            <Route exact path="/login" component={Login} />
            <Route exact path="/register" component={Register} />
            <PrivateRoute exact path="/connect" component={Connect} />
            <PrivateRoute exact path="/home" component={Home} />
            <PrivateRoute path="/*">
              <Redirect to="/connect" />
            </PrivateRoute>
          </Switch>
        </Router>
      </MuiThemeProvider>
    </AuthProvider>
  );
};

export default App;
