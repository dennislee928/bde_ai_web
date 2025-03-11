import React from "react";

function MessageBoard({ messages }) {
  return (
    <div className="message-board" id="messageBoard">
      {messages.map((message, index) => (
        <div key={index} className="message">
          <p className="author">{message.author}:</p>
          <p>{message.content}</p>
        </div>
      ))}
    </div>
  );
}

export default MessageBoard;
