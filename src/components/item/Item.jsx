import React from "react";

import styles from "./item.module.scss";

function formatDate(lastMessageDate) {
  // Get the current time in milliseconds
  let now = Date.now();

  // Get the difference between the date and the current time in milliseconds
  let diff = now - new Date(lastMessageDate).getTime();

  // Convert the difference to seconds, minutes, hours, and days
  let seconds = Math.floor(diff / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  let days = Math.floor(hours / 24);

  // Create a human readable format based on the difference
  let format;
  if (seconds < 60) {
    format = `${seconds}s`;
  } else if (minutes < 60) {
    format = `${minutes}min`;
  } else if (hours < 24) {
    format = `${hours}h`;
  } else {
    format = `${days}d`;
  }

  return format;
}

export const Item = ({
  item: { id, fname, lname, type, intro, lastMessageDate },
  selected,
  onSelect,
}) => {
  return (
    <div className={styles.item} onClick={() => onSelect(id)}>
      <div className={styles.head}>
        <div className={styles.check}>
          <input
            type={"checkbox"}
            onChange={() => onSelect(id)}
            checked={selected}
          />
        </div>
        <div className={styles.title}>
          <div>
            {fname} {""}
            {lname}
          </div>
          <small>Facebook {type}</small>
        </div>
        <div className={styles.time}>{formatDate(lastMessageDate)}</div>
      </div>
      <div className={styles.intro}>
        <div className={styles.heading}>{intro.title}</div>
        <div className={styles.message}>{intro.message}</div>
      </div>
    </div>
  );
};
