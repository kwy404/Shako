import React, { useEffect, useState } from 'react';
import defaultAvatar from "../../resources/images/default_avatar.webp";
import './index.css';

interface NotificationProps {
  id: string;
  message: string;
  senderName: string;
  senderAvatar: string;
  onClose: (id: string) => void;
}

const Notification: React.FC<NotificationProps> = ({
  id,
  message,
  senderName,
  senderAvatar,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose(id);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`notification ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="avatar">
        <img src={senderAvatar ? senderAvatar : defaultAvatar} alt="Profile Avatar" />
      </div>
      <div className="content">
        <p>
          <strong>{senderName}</strong> {message}
        </p>
      </div>
    </div>
  );
};

export default Notification;
