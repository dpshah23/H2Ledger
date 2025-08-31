import React from "react";

interface ChatToggleProps {
  onClick: () => void;
  isOpen: boolean;
}

const ChatToggle: React.FC<ChatToggleProps> = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className="w-14 h-14 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition"
    >
      {isOpen ? "✖" : "💬"}
    </button>
  );
};

export default ChatToggle;
