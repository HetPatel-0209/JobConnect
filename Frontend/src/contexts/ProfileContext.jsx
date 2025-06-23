import { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { AuthService } from '../services/auth.service';
import { ApplicationService } from '../services/application.service';
import cacheService, { CacheKeys, CacheInvalidation } from '../services/cache.service';

export const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  // Memoize cache keys to prevent unnecessary recalculations
  const cacheKeys = useMemo(() => {
    const userId = user?.id || user?._id;
    if (!userId) return null;
    return {
      profile: CacheKeys.USER_PROFILE(userId),
      applications: CacheKeys.USER_APPLICATIONS(userId)
    };
  }, [user?.id, user?._id]);

  // Subscribe to cache updates for real-time profile updates
  useEffect(() => {
    if (!cacheKeys) return;

    const unsubscribe = cacheService.subscribe(
      [cacheKeys.profile, cacheKeys.applications],
      ({ key, data, action }) => {
        if (action === 'deleted') return;

        if (key === cacheKeys.profile && data) {
          setProfileData(data);
          if (data.profilePic) {
            setProfileImage(data.profilePic);
          }
        } else if (key === cacheKeys.applications && data) {
          setApplications(Array.isArray(data) ? data : []);
        }
      }
    );

    return unsubscribe;
  }, [cacheKeys]);

  useEffect(() => {
    if (user && cacheKeys) {
      fetchProfile();
    } else {
      setProfileData(null);
      setApplications([]);
    }
  }, [user, cacheKeys]);

  const fetchProfile = useCallback(async (forceRefresh = false) => {
    if (!user || !cacheKeys) return;

    // Prevent rapid successive calls
    const now = Date.now();
    if (!forceRefresh && now - lastFetchTime < 2000) {
      // Return current profileData without causing re-render
      return profileData;
    }
    setLastFetchTime(now);

    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedProfile = cacheService.get(cacheKeys.profile);
      if (cachedProfile) {
        setProfileData(cachedProfile);
        if (cachedProfile.profilePic) {
          setProfileImage(cachedProfile.profilePic);
        }
        return cachedProfile;
      }
    }

    setLoading(true);
    setError(null);

    try {
      // Use cache service for smart fetching
      const userData = await cacheService.getOrFetch(cacheKeys.profile, async () => {
        const response = await AuthService.getProfile();
        return response.user || response;
      });

      setProfileData(userData);
      if (userData?.profilePic) {
        setProfileImage(userData.profilePic);
      }

      return userData;
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, cacheKeys, lastFetchTime]); // Removed profileData from dependencies to prevent infinite loop

  const updateProfile = useCallback(async (updatedData) => {
    if (!cacheKeys) return;

    setLoading(true);
    setError(null);

    try {
      const response = await AuthService.updateProfile(updatedData);
      const userData = response.user || response;

      // Update local state
      setProfileData(userData);
      if (userData?.profilePic) {
        setProfileImage(userData.profilePic);
      }

      // Update cache with new data
      cacheService.set(cacheKeys.profile, userData);      // Invalidate related caches using smart invalidation
      CacheInvalidation.invalidateByEvent('profile_updated', { userId: user.id });

      return response;
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cacheKeys, user?.id]);

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
      console.error(err);
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
    setLastFetchTime(0);

    // Clear related cache entries
    if (cacheKeys) {
      cacheService.delete(cacheKeys.profile);
      cacheService.delete(cacheKeys.applications);
    }
  }, [cacheKeys]);

  const fetchApplications = useCallback(async (forceRefresh = false) => {
    if (!cacheKeys) return;

    // Check cache first if not forcing refresh
    if (!forceRefresh) {
      const cachedApplications = cacheService.get(cacheKeys.applications);
      if (cachedApplications) {
        setApplications(Array.isArray(cachedApplications) ? cachedApplications : []);
        return cachedApplications;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await cacheService.getOrFetch(cacheKeys.applications, async () => {
        return await ApplicationService.getUserApplications();
      });

      setApplications(Array.isArray(response) ? response : []);
      return response;
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError('Failed to load applications');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [cacheKeys]);

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
