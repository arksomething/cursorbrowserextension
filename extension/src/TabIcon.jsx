import React from 'react';
import './TabIcon.css'

const TabIcon = ({ data }) => {
  // Check if 'data' is available and if 'data.title' and 'data.favicon' exist
  const title = data?.title || 'No Data Found'; // Use empty string as fallback if data.title is undefined
  const favicon = data?.favicon || "/favicon.ico"; // Fallback if data.favicon is undefined
  
  return (
    <div className='tabicon-wrapper'>
      <img 
        className="tabicon-favicon" 
        src={favicon} 
        alt="Active Tab Favicon" 
      />
      <div className='tabicon-title'>
        {title.length > 15 ? `${title.slice(0, 15)}...` : title}
      </div>
    </div>
  );
};

export default TabIcon;
