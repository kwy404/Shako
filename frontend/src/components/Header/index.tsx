import React from 'react';
import { Toolbar, ToolbarButton, Icon, Input } from 'react-onsenui';
import { Link } from 'react-router-dom';

interface HeaderProps {
  user: {
    username: string;
    profileImage: string;
  };
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <Toolbar className="header">
      <div className="left">
        
      </div>
      <div className="center">
        <Link to="/" className="logo">
          Tumblr
        </Link>
      </div>
      <div className="right">
        <img src={user.profileImage} alt="Profile" className="profile-image" />
      </div>
      <div className="search-bar">
        <Input type="search" placeholder="Search Tumblr" className="search-input" />
        <Icon icon="md-search" className="search-icon" />
      </div>
    </Toolbar>
  );
};

export default Header;
