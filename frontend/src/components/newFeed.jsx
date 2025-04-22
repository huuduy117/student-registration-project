//components/NewFeed.jsx
import "../assets/NewFeed.css";
import { useState } from "react";
import { FaComments, FaTimes } from "react-icons/fa";
import Chat from "../pages/Chat";

export default function NewFeed() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      <div className="new-feed-wrapper">
        <div className="new-feed-header">
          <img
            alt="avatar"
            src="https://placehold.co/52x52/png"
            className="new-feed-avatar"
          />
          <div className="new-feed-user-name">Adu User</div>
          <button className="new-feed-view-button">View</button>
        </div>
        <div className="new-feed-main">
          <div className="new-feed-content">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin
            mollis sodales turpis, eget laoreet dui.
          </div>
        </div>
      </div>

      <button className="chat-toggle-button" onClick={toggleChat} title="Chat">
        <FaComments />
      </button>

      {isChatOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>Chat Rooms</h3>
            <button className="chat-close-button" onClick={toggleChat}>
              <FaTimes />
            </button>
          </div>
          <div className="chat-content">
            <Chat isFloating={true} />
          </div>
        </div>
      )}
    </>
  );
}
