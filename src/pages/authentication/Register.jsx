import React, { useContext, useState } from "react";
import { withRouter, Redirect } from "react-router";
import { AuthContext } from "./AuthProvider";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { Card, CircularProgress, Snackbar } from "@material-ui/core";
import { Link } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import axios from "axios";
import config from "../../environments/config";
import { Alert } from "@material-ui/lab";

const Register = ({ history }) => {
  const { currentAgent, setCurrentAgent } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [snackbarSettings, setSnackbarSettings] = useState({
    visible: false,
    message: "",
    vertical: "bottom",
    horizontal: "center",
    autoHideDuration: 1000,
    type: "success",
  });

  const useStyles = makeStyles((theme) => ({
    container: {
      background: theme.palette.primary.main,
      height: "100vh",
    },
    card: {
      width: "30%",
      borderRadius: "1em",
    },
    paper: {
      padding: "3em 3em 2em 3em",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    form: {
      width: "100%",
    },
    title: {
      fontWeight: "bold",
    },
    label: { display: "block", marginBottom: "0.1em", marginTop: "1em" },
    input: {
      padding: "0.5em",
      width: "100%",
      borderRadius: "0.5em",
      border: "1px solid #d1d1d1",
      margin: "0.5em 0 0 0",
    },
    error: {
      color: "red",
    },
    submit: {
      margin: "1em 0 2em",
      textTransform: "none",
    },
  }));

  const classes = useStyles();

  const registerSchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "Too Short!")
      .max(50, "Too Long!")
      .required("Name is required"),
    email: Yup.string().email("Email is invalid").required("Email is required"),
    password: Yup.string()
      .required("Password is required")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/,
        "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"
      ),
  });

  if (currentAgent) {
    return <Redirect to="/" />;
  }

  return (
    <Grid
      className={classes.container}
      container
      direction="row"
      justifyContent="center"
      alignItems="center"
    >
      <CssBaseline />
      <Card className={classes.card}>
        <div className={classes.paper}>
          <Typography className={classes.title} component="h6" variant="h6">
            Create Account
          </Typography>
          <Formik
            initialValues={{
              name: "",
              email: "",
              password: "",
              remember: false,
            }}
            validationSchema={registerSchema}
            validateOnBlur={true}
            validateOnChange={true}
            onSubmit={async (values) => {
              // same shape as initial values
              try {
                setLoading(true);
                const { data } = await axios.post(
                  config.API_URL + "auth/register",
                  {
                    ...values,
                  }
                );
                const { success, message, newAgent } = data;
                if (success) {
                  setSnackbarSettings((prev) => {
                    return {
                      ...prev,
                      message: message,
                      type: "success",
                      vertical: "bottom",
                      horizontal: "right",
                      visible: true,
                    };
                  });
                  setTimeout(() => setCurrentAgent(newAgent), 500);
                } else {
                  setSnackbarSettings((prev) => {
                    return {
                      ...prev,
                      message: message,
                      type: "error",
                      vertical: "bottom",
                      horizontal: "left",
                      visible: true,
                    };
                  });
                }
              } catch (error) {
                console.log(error);
              } finally {
                setLoading(false);
              }
            }}
          >
            {({ values, setFieldValue, errors, touched }) => (
              <Form className={classes.form}>
                <label className={classes.label} htmlFor="name">
                  Name
                </label>
                <Field
                  required
                  id="name"
                  className={classes.input}
                  name="name"
                  placeholder="Manoj Kumar"
                  autoComplete="name"
                  autoFocus
                />
                {touched.name && errors.name ? (
                  <div className={classes.error}>{errors.name}</div>
                ) : null}
                <label className={classes.label} htmlFor="email">
                  Email
                </label>
                <Field
                  required
                  id="email"
                  className={classes.input}
                  name="email"
                  placeholder="manoj@richpanel.com"
                  autoComplete="email"
                />
                {touched.email && errors.email && (
                  <div className={classes.error}>{errors.email}</div>
                )}
                <label className={classes.label} htmlFor="password">
                  Password
                </label>
                <Field
                  required
                  id="password"
                  className={classes.input}
                  name="password"
                  type="password"
                  placeholder="*************"
                  autoComplete="current-password"
                />
                {touched.password && errors.password && (
                  <div className={classes.error}>{errors.password}</div>
                )}
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      value={values.remember}
                      onChange={(e) => setFieldValue("remember", true)}
                      color="primary"
                    />
                  }
                  label={<Typography variant="body2">Remember Me</Typography>}
                ></FormControlLabel>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                >
                  {loading ? (
                    <CircularProgress size={25} color="inherit" />
                  ) : (
                    "Login"
                  )}
                </Button>
                <Grid container justifyContent="center">
                  <Typography variant="body2">
                    {"Already have an account? "}
                    <Link style={{ color: "#004E97" }} to="/login">
                      {"Login"}
                    </Link>
                  </Typography>
                </Grid>
              </Form>
            )}
          </Formik>
        </div>
      </Card>
      <Snackbar
        anchorOrigin={{
          vertical: snackbarSettings.vertical,
          horizontal: snackbarSettings.horizontal,
        }}
        open={snackbarSettings.visible}
        autoHideDuration={snackbarSettings.autoHideDuration}
        onClose={() =>
          setSnackbarSettings((prev) => {
            return { ...prev, visible: false };
          })
        }
      >
        <Alert
          variant="filled"
          onClose={() =>
            setSnackbarSettings((prev) => {
              return { ...prev, visible: false };
            })
          }
          severity={snackbarSettings.type}
        >
          {snackbarSettings.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default withRouter(Register);
