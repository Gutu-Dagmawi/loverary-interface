import React, { createContext } from 'react';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: () => {},
  register: () => {},
  logout: () => {}
});

export default AuthContext;
