import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { logout } from '@services/auth.service.js';
import '@styles/navbar.css';
import { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const userRole = user?.rol;
    const [menuOpen, setMenuOpen] = useState(false);

    const logoutSubmit = () => {
        try {
            logout();
            navigate('/auth'); 
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    return (
        <nav className="navbar">
            
            <div className={`nav-menu ${menuOpen ? 'activado' : ''}`}>
                <ul>
                    {userRole === 'administrador' && (
                        <li>
                            <NavLink to="/users" className={({ isActive }) => isActive ? 'active' : ''}>
                                Usuarios
                            </NavLink>
                        </li>
                    )}
                    {userRole === 'administrador' && (
                        <li>
                            <NavLink to="/gestion-periodos" className={({ isActive }) => isActive ? 'active' : ''}>
                                Gestionar Períodos
                            </NavLink>
                        </li>
                    )}
                    {userRole === 'Alumno' && (
                        <li>
                            <NavLink to="/mis-electivos" className={({ isActive }) => isActive ? 'active' : ''}>
                                Mis Electivos
                            </NavLink>
                        </li>
                    )}
                    <li>
                        <NavLink to="/auth" onClick={logoutSubmit}>
                            Cerrar sesión
                        </NavLink>
                    </li>
                </ul>
            </div>
            <div className="nav-right">
                <div className="hamburger" onClick={toggleMenu}>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;