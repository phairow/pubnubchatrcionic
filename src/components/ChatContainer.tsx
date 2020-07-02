import React from 'react';
import './ChatContainer.css';

interface ContainerProps {
  name: string;
}

const ChatContainer: React.FC<ContainerProps> = ({ name }) => {
  return (
    <div className="container">
        hi
    </div>
  );
};

export default ChatContainer;
