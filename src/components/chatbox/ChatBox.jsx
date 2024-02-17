import { Avatar } from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { useContext } from "react";
import { AuthContext } from "../../pages/authentication/AuthProvider";
import styles from "./chatBox.module.scss";
import axios from "axios";
import config from "../../environments/config";

const Chat = ({ message }) => {
  return <span className={styles.message}>{message}</span>;
};

const dateOptions = {
  hour: "2-digit",
  minute: "2-digit",
  month: "short",
  day: "numeric",
};

export const ChatBox = ({
  item: { fname, lname, messages, profile, sender },
  updateMessages,
}) => {
  const { fbUser } = useContext(AuthContext);

  const [messageText, setMessageText] = useState();

  useEffect(() => {
    let element = document.querySelector("#chathistory");
    element.scrollTop = element.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    const requestData = {
      pageAccessToken: fbUser.pages[0].access_token,
      senderId: sender,
      message: {
        text: messageText,
      },
    };
    try {
      axios.post(config.API_URL + "message/send", requestData);
      updateMessages(messageText, sender);
      setMessageText("");
    } catch (error) {
      alert("Unable to send the message!");
    }
  };

  return (
    <div className={styles.chatBox}>
      <div id="chathistory" className={styles.history}>
        {messages.map((message, idx) => {
          return message.isFromCustomer ? (
            <div key={idx} className={styles.leftChatBubble}>
              <div className={styles.chatItem}>
                <div className={styles.avatar}>
                  <Avatar src={profile} />
                </div>
                <div className={styles.messages}>
                  <Chat message={message.message.text} />

                  <small className={styles.date}>
                    {fname} {lname}
                    {" - "}
                    {new Date(message.date).toLocaleString(
                      "en-US",
                      dateOptions
                    )}
                  </small>
                </div>
              </div>
            </div>
          ) : (
            <div key={idx} className={styles.rightChatBubble}>
              <div className={styles.chatItem}>
                <div className={styles.messages}>
                  <Chat message={message.message.text} />

                  <small className={styles.date}>
                    {fbUser && fbUser.name}
                    {" - "}
                    {new Date(message.date).toLocaleString(
                      "en-US",
                      dateOptions
                    )}
                  </small>
                </div>
                <div className={styles.avatar}>
                  <Avatar
                    src={
                      fbUser && (fbUser.picture?.data?.url ?? fbUser.picture)
                    }
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.input}>
        <input
          type="text"
          placeholder={`Message ${fname} ${lname}`}
          value={messageText}
          onChange={(event) => {
            setMessageText(event.target.value);
          }}
          onKeyDown={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        ></input>
        <i
          onClick={() => sendMessage()}
          className={styles.icon + " fa fa-send"}
        />
      </div>
    </div>
  );
};
