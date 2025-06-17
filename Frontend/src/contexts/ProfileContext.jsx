import React, { createContext, useState } from 'react';

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profileImage, setProfileImage] = useState(null);
  const [applications, setApplications] = useState([]);
  const [currentUserEmail, setCurrentUserEmail] = useState("");

  return (
    <ProfileContext.Provider value={{
      profileImage,
      setProfileImage,
      applications,
      setApplications,
      currentUserEmail,
      setCurrentUserEmail
    }}>
      {children}
    </ProfileContext.Provider>
  );
};
