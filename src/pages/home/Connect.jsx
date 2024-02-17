import React, { useContext, useState } from "react";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import {
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
} from "@material-ui/core";
import { withRouter } from "react-router";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import config from "../../environments/config";
import axios from "axios";
import { AuthContext } from "../authentication/AuthProvider";

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
    padding: "2em 4em",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  titleContainer: {
    padding: "1.5em 0",
    display: "flex",
  },
  title: {
    fontWeight: "bold",
  },
  button: {
    marginTop: "1em",
    padding: "0.75em 0",
    textTransform: "none",
  },
  fab: {
    position: "absolute",
    left: "2em",
    bottom: "2em",
  },
}));

const Connect = ({ history }) => {
  const classes = useStyles();
  const { currentAgent, setCurrentAgent, fbUser, setFBUser } =
    useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const responseFacebook = (response) => {
    setLoading(true);
    const { accessToken, userID, name, email, picture } = response;
    axios
      .get(
        `https://graph.facebook.com/${userID}/accounts?access_token=${accessToken}`,
        {
          withCredentials: false,
        }
      )
      .then((pagesRes) => {
        const pages = pagesRes.data.data;
        const userObj = {
          accessToken,
          userID,
          name,
          email,
          picture,
          pages,
        };
        axios
          .post(config.API_URL + "fb/connect", userObj)
          .then((response) => {
            setFBUser(response.data);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setLoading(false);
      });
  };

  const disconnectFBPage = async () => {
    try {
      const disconnectRes = await axios.delete(
        config.API_URL + "fb/disconnect"
      );
      if (disconnectRes.status === 200) {
        setFBUser(null);
        setShowDisconnectDialog(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const logout = async () => {
    try {
      await axios.get(config.API_URL + "auth/logout");
      setCurrentAgent(null);
    } catch (error) {
      console.error(error);
    }
  };

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
          <Grid
            container
            justifyContent="center"
            className={classes.titleContainer}
          >
            <Typography className={classes.title} component="h6" variant="h6">
              Facebook Page Integration
            </Typography>
            {fbUser?.pages?.[0] && (
              <Typography variant="h6">
                Integrated Page: <strong>{fbUser.pages[0]?.name}</strong>
              </Typography>
            )}
          </Grid>
          {!fbUser?.pages?.[0] ? (
            <FacebookLogin
              appId={config.APP_ID}
              fields="name,email,picture"
              scope="business_management,pages_manage_metadata,pages_manage_engagement,pages_messaging,pages_read_engagement,pages_read_user_content,pages_show_list,pages_manage_cta"
              callback={responseFacebook}
              render={(props) => (
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.button}
                  onClick={props.onClick}
                >
                  {loading ? (
                    <CircularProgress size={25} color="inherit" />
                  ) : (
                    "Connect Page"
                  )}
                </Button>
              )}
            />
          ) : (
            <>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                className={classes.button}
                onClick={() => setShowDisconnectDialog(true)}
              >
                Delete Integration
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                className={classes.button}
                onClick={() => history.push("/home")}
              >
                Reply to Messages
              </Button>
            </>
          )}
        </div>
      </Card>
      <Dialog
        open={showDisconnectDialog}
        onClose={() => setShowDisconnectDialog(false)}
      >
        <DialogTitle>
          {"Are you sure you want to disconnect the integrated page?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Disconnecting your Facebook page will also remove the page
            permissions granted by you for managing the page. You will need to
            grant those permissions once again the next you connect the page.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDisconnectDialog(false)}>No</Button>
          <Button onClick={disconnectFBPage} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
      >
        <DialogTitle>{"Are you sure you want to logout?"}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setShowLogoutDialog(false)}>No</Button>
          <Button onClick={logout} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Fab
        className={classes.fab}
        onClick={() => setShowLogoutDialog(true)}
        color="inherit"
        aria-label="add"
      >
        <i
          style={{ color: "#004E97" }}
          className="fa fa-sign-out fa-lg ml-1"
        ></i>
      </Fab>
    </Grid>
  );
};

export default withRouter(Connect);
