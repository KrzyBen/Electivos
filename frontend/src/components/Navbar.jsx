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
        setMenuOpen((prev) => !prev);
    };

    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    const linkClass = ({ isActive }) => isActive ? 'active' : '';
    const closeMenu = () => setMenuOpen(false);

    return (
        <nav className="navbar">
            <div className={`nav-menu ${menuOpen ? 'activado' : ''}`}>
                <ul>
                    <li>
                        <NavLink to="/home" className={linkClass} onClick={closeMenu}>
                            Inicio
                        </NavLink>
                    </li>
                    {userRole === 'administrador' && (
                        <>
                          <li>
                              <NavLink to="/users" className={linkClass} onClick={closeMenu}>
                                  Usuarios
                              </NavLink>
                          </li>
                          <li>
                              <NavLink to="/gestion-periodos" className={linkClass} onClick={closeMenu}>
                                  Gestionar Períodos
                              </NavLink>
                          </li>
                          <li>
                              <NavLink to="/all/list" className={linkClass} onClick={closeMenu}>
                                  Todos los Electivos
                              </NavLink>
                          </li>
                          <li>
                                <NavLink to="/alumno/lista" className={linkClass}>
                                    Gestión Electivos
                                </NavLink>
                          </li>
                        </>
                    )}
                    {userRole === 'Alumno' && (
                        <li>
                            <NavLink to="/mis-electivos" className={linkClass} onClick={closeMenu}>
                                Mis Electivos
                            </NavLink>
                        </li>
                    )}
                    {userRole === 'Profesor' && (
                        <li>
                            <NavLink to="/electives" className={linkClass} onClick={closeMenu}>
                              Mis Electivos
                            </NavLink>
                        </li>
                    )}
                    <li>
                        <NavLink to="/auth" onClick={() => { logoutSubmit(); closeMenu(); }}>
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