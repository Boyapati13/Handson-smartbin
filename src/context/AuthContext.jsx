import { createContext, useContext, useState, useCallback } from 'react';

const USERS = {
  'demo@handson.io':  { password: 'demo1234',    role: 'demo',  name: 'Demo Account' },
  'admin@handson.io': { password: 'handson2024', role: 'admin', name: 'Administrator' },
};

const KEY = 'hs_auth';

function loadUser() {
  try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const login = useCallback((email, password) => {
    const record = USERS[email.trim().toLowerCase()];
    if (!record || record.password !== password) return false;
    const u = { email: email.trim().toLowerCase(), role: record.role, name: record.name };
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isDemo: user?.role === 'demo' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export const DEMO_CREDS  = { email: 'demo@handson.io',  password: 'demo1234'    };
export const ADMIN_CREDS = { email: 'admin@handson.io', password: 'handson2024' };
