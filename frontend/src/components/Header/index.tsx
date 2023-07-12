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
    <>
    
    </>
  );
};

export default Header;
