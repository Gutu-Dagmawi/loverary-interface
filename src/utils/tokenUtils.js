const USER_INFO_KEY = 'user_info';

// Helper function for consistent logging
const logger = {
  info: (operation, data = {}) => {
    console.log(`[TokenUtils][${operation}]`, data);
  },
  error: (operation, error, data = {}) => {
    console.error(`[TokenUtils][${operation}][ERROR]`, { ...data, error: error?.message || error });
  }
};

export const getToken = () => {
  try {
    const userData = localStorage.getItem(USER_INFO_KEY);
    const hasUserData = !!userData;
    
    logger.info('getToken', { 
      hasUserData,
      hasToken: hasUserData && JSON.parse(userData)?.token ? true : false 
    });
    
    if (!userData) return null;
    
    const user = JSON.parse(userData);
    const token = user?.token || null;
    
    return token;
  } catch (error) {
    logger.error('getToken', error, { userInfoKey: USER_INFO_KEY });
    return null;
  }
};

export const getUserInfo = () => {
  try {
    const userData = localStorage.getItem(USER_INFO_KEY);
    const hasUserData = !!userData;
    
    logger.info('getUserInfo', { hasUserData });
    
    if (!userData) return null;
    
    const user = JSON.parse(userData);
    logger.info('getUserInfo', { 
      userId: user?.id,
      email: user?.email,
      hasToken: !!user?.token
    });
    
    return user;
  } catch (error) {
    logger.error('getUserInfo', error, { userInfoKey: USER_INFO_KEY });
    return null;
  }
};

export const setUserInfo = (userData) => {
  try {
    logger.info('setUserInfo', { 
      userId: userData?.id,
      email: userData?.email,
      hasToken: !!userData?.token
    });
    
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userData));
  } catch (error) {
    logger.error('setUserInfo', error, { 
      userInfoKey: USER_INFO_KEY,
      userData: { id: userData?.id, email: userData?.email }
    });
    throw error; // Re-throw to allow callers to handle the error
  }
};

export const clearUserInfo = () => {
  try {
    // Log the current user info before clearing
    const currentUser = getUserInfo();
    
    logger.info('clearUserInfo', { 
      hadUser: !!currentUser,
      userId: currentUser?.id,
      email: currentUser?.email
    });
    
    localStorage.removeItem(USER_INFO_KEY);
    
    // Verify the data was cleared
    const afterClear = localStorage.getItem(USER_INFO_KEY);
    if (afterClear !== null) {
      logger.error('clearUserInfo', new Error('Failed to clear user info'), {
        userInfoKey: USER_INFO_KEY,
        remainingData: afterClear
      });
    }
  } catch (error) {
    logger.error('clearUserInfo', error, { userInfoKey: USER_INFO_KEY });
    throw error; // Re-throw to allow callers to handle the error
  }
};
