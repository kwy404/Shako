import React from 'react';
import './loading.css';

const Loading: React.FC = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner"></div>
    </div>
  );
};

export default Loading;
