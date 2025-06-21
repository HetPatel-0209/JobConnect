import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { AuthService } from '../services/auth.service';
import { ApplicationService } from '../services/application.service';

export const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch profile data when user changes
  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfileData(null);
    }
  }, [user]);
  
  const fetchProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await AuthService.getProfile();
      setProfileData(response.user || response);

      // If profile has an image URL, set it
      if (response.user?.profilePic) {
        setProfileImage(response.user.profilePic);
      } else if (response.profilePic) {
        setProfileImage(response.profilePic);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(async (updatedData) => {
    setLoading(true);
    try {
      const response = await AuthService.updateProfile(updatedData);
      setProfileData(response.user || response);

      // Update profile image if it was updated
      if (response.user?.profilePic) {
        setProfileImage(response.user.profilePic);
      }

      return response;
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadProfileImage = useCallback(async (imageFile) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('profilePic', imageFile);

      const response = await AuthService.uploadProfilePicture(formData);

      // Update the profile image state
      if (response.user?.profilePic) {
        setProfileImage(response.user.profilePic);
      }

      return response;
    } catch (err) {
      console.error('Error uploading profile image:', err);
      setError('Failed to upload profile image');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearProfile = useCallback(() => {
    setProfileData(null);
    setProfileImage(null);
    setApplications([]);
    setError(null);
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await ApplicationService.getUserApplications();
      setApplications(response);
      return response;
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Memoized setProfileImage to prevent infinite re-renders
  const memoizedSetProfileImage = useCallback((image) => {
    setProfileImage(image);
  }, []);

  return (
    <ProfileContext.Provider value={{
      profileData,
      profileImage,
      applications,
      loading,
      error,
      setProfileImage: memoizedSetProfileImage,
      updateProfile,
      uploadProfileImage,
      fetchProfile,
      fetchApplications,
      clearProfile
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
