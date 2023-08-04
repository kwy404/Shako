import React, { useState } from 'react';
import './index.css';
import { Link } from "react-router-dom";
import defaultAvatar from "../../resources/images/default_avatar.webp";
import defaultBanner from "../../resources/images/default_banner.jpg";

interface Props {
  user: any;
}

const CardUser: React.FC<Props> = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
    <Link to="/dashboard">
    <div className='card--user'>
      <div className="info--header">
        <div 
        style={{
            backgroundImage: `url("${user.banner ? user.banner : defaultBanner}")`
        }}
        className="banner">
        </div>
        <div className="avatar">
            <img src={user.avatar ? user.avatar : defaultAvatar} alt="" />
        </div>
        <h1 className='username'>{user.username}#{user.discrimination}</h1>
      </div>
    </div>
    </Link>
    </>
  );
};

export default CardUser;
