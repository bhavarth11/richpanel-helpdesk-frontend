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
import { Box, Snackbar, Typography } from "@material-ui/core";
import notificationSound from "../../assets/sounds/notification.mp3";
import config from "../../environments/config";
import { Alert } from "@material-ui/lab";

const Home = ({ history }) => {
  const { currentAgent, setCurrentAgent, fbUser, setFBUser } =
    useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showSocketConnected, setShowSocketConnected] = useState(false);
  const audioRef = useRef(null);

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
  }, []);

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
          <ListItem button onClick={() => history.replace("/connect")}>
            <i
              style={{ color: "white" }}
              className="fa fa-sign-out fa-lg ml-1"
            ></i>
          </ListItem>
        </List>
        <List>
          <ListItem>
            {!fbUser && <AccountCircle className={styles.icon} />}
          </ListItem>
          <ListItem>
            {fbUser && (
              <img
                src={fbUser.picture?.data?.url ?? fbUser.picture}
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
      >
        <Alert
          variant="filled"
          onClose={() => setShowSocketConnected(false)}
          severity="success"
        >
          Connection Successful! You are now online and can receive messages!
        </Alert>
      </Snackbar>
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
