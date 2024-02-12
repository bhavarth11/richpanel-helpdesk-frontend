import { useEffect, useRef, useState } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import { AccountCircle, Menu } from "@material-ui/icons";
import RefreshIcon from "@material-ui/icons/Refresh";
import styles from "./Home.module.scss";
import io from "socket.io-client";
// import { useState } from "react";
import { Item } from "../../components/item/Item";
import { Profile } from "../../components/profile/Profile";
import { ChatBox } from "../../components/chatbox/ChatBox";
import { withRouter } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../authentication/AuthProvider";
import logo from "../../assets/White.png";
import axios from "axios";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Typography,
} from "@material-ui/core";
import notificationSound from "../../assets/sounds/notification.mp3";
import config from "../../environments/config";

const Home = ({ history }) => {
  // const [currentUser, setCurrentUser] = useState();
  const { currentUser, setCurrentUser } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showSocketConnected, setShowSocketConnected] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const audioRef = useRef(null);

  const refreshPageAccessToken = () => {
    const { userID, accessToken } = currentUser;
    axios
      .get(
        `https://graph.facebook.com/${userID}/accounts?access_token=${accessToken}`
      )
      .then((pagesRes) => {
        const pages = pagesRes.data.data;
        const userObj = {
          ...currentUser,
          accessToken,
          pages,
        };
        axios
          .post(config.API_URL + "auth", userObj)
          .then((response) => {
            setCurrentUser(response.data);
            localStorage.setItem("user", JSON.stringify(userObj));
            localStorage.setItem("token", accessToken);
          })
          .catch((err) => console.log(err));
      })
      .catch((err) => console.log(err))
      .finally(() => {});
  };

  const updateMessages = (message, sender) => {
    let tempSelected = { ...selected };
    tempSelected.messages = [
      ...tempSelected.messages,
      {
        message: {
          attachments: [],
          text: message,
        },
        sender: sender,
        date: new Date(),
        isFromCustomer: false,
      },
    ];
    setSelected(tempSelected);
  };

  const getMessages = () => {
    return axios
      .get(config.API_URL + "message")
      .then((response) => {
        let formattedData = response.data.map((ele, index) => {
          return {
            ...ele,
            idx: index,
            fname: "User",
            lname: "" + (index + 1),
            email: `user${index + 1}@facebook.com`,
            profile: `https://xsgames.co/randomusers/assets/avatars/male/${index}.jpg`,
            intro: {
              title: ele.messages[ele.messages.length - 1]?.message.text,
              message:
                ele.messages[ele.messages.length - 2]?.message.text ?? "",
            },
            sender: ele.messages[0].sender,
          };
        });
        setConversations(formattedData);
        setSelected(formattedData?.[0]);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    const sound = new Audio(notificationSound);
    const socket = io.connect(config.SOCKET_URL);
    socket.on("connect", () => setShowSocketConnected(true));
    socket.on("messageReceived", (data) => {
      getMessages();
      if (!document.hasFocus()) {
        sound.play();
      }
    });
    getMessages();
    refreshPageAccessToken();
  }, []);

  const logout = () => {
    setShowLogoutDialog(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setCurrentUser(null);
    history.replace("/login");
  };

  return (
    <div className={styles.container}>
      <div className={styles.nav}>
        <List>
          <ListItem>
            <img
              src={logo}
              className="rounded-circle"
              height="30px"
              width="30px"
              alt="logo"
            />
          </ListItem>
          <ListItem className={styles.active}>
            <i
              style={{ color: "#255190" }}
              className="fa fa-inbox fa-lg ml-1"
            ></i>
          </ListItem>
          <ListItem>
            <i style={{ color: "white" }} className="fa fa-user fa-lg ml-1"></i>
          </ListItem>
          <ListItem>
            <i
              style={{ color: "white" }}
              className="fa fa-line-chart fa-lg ml-1 m-10"
            ></i>
          </ListItem>
          <ListItem button onClick={() => setShowLogoutDialog(true)}>
            <i
              style={{ color: "white" }}
              className="fa fa-sign-out fa-lg ml-1"
            ></i>
          </ListItem>
        </List>
        <List>
          <ListItem>
            {!currentUser && <AccountCircle className={styles.icon} />}
          </ListItem>
          <ListItem>
            {currentUser && (
              <img
                src={currentUser.picture?.data?.url ?? currentUser.picture}
                className="rounded-circle"
                height="30px"
                width="30px"
                alt="profile"
              />
            )}
          </ListItem>
        </List>
      </div>
      <div className={styles.list}>
        <div className={styles.title}>
          <Menu />
          Conversations
          <RefreshIcon style={{ cursor: "pointer" }} onClick={getMessages} />
        </div>
        <div>
          {conversations.length > 0 ? (
            conversations.map((item, idx) => (
              <div
                key={idx}
                className={
                  selected && item.sender === selected.sender
                    ? styles.selected
                    : ""
                }
              >
                <Item
                  item={item}
                  selected={selected && item.sender === selected.sender}
                  onSelect={() => {
                    setSelected(item);
                  }}
                />
              </div>
            ))
          ) : (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              padding={1}
            >
              <Typography variant="body2">No conversations yet</Typography>
            </Box>
          )}
        </div>
      </div>

      {selected ? (
        <>
          {" "}
          <div className={styles.chatBox}>
            <div className={styles.title}>
              {selected && (
                <>
                  {selected.fname} {selected.lname}
                </>
              )}
            </div>
            <div>
              {selected && (
                <ChatBox updateMessages={updateMessages} item={selected} />
              )}
            </div>
          </div>
          <div className={styles.infoBox}>
            {selected && <Profile item={selected} />}
          </div>
        </>
      ) : (
        <div className={styles.noSelect}>
          Please select a conversation to start sending messages
        </div>
      )}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={showSocketConnected}
        autoHideDuration={2000}
        onClose={() => setShowSocketConnected(false)}
        message={
          "Connection Successful! You are now online and can receive messages!"
        }
      ></Snackbar>
      <Dialog
        open={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Are you sure you want to Logout?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Logging out with also remove the page permissions granted by you for
            managing your connected facebook page. You will need to grant those
            permissions again when you log in.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLogoutDialog(false)}>No</Button>
          <Button onClick={logout} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <audio ref={audioRef}>
        <source
          src="https://cdn.pixabay.com/audio/2022/10/04/audio_79bd7a4d75.mp3"
          type="audio/mpeg"
        />
      </audio>
    </div>
  );
};

export default withRouter(Home);
