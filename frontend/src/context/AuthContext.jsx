import { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const storedUser = JSON.parse(sessionStorage.getItem('usuario'));

    const user = storedUser
        ? {
            ...storedUser,
            rol: storedUser.rol?.toLowerCase(),
          }
        : null;

    const isAuthenticated = !!user;

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth');
        }
    }, [isAuthenticated, navigate]);

    return (
        <AuthContext.Provider value={{ isAuthenticated, user }}>
            {children}
        </AuthContext.Provider>
    );
}
