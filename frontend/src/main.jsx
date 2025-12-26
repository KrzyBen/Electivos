import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import Home from '@pages/Home';
import Users from '@pages/Users';
import Register from '@pages/Register';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import ProtectedRoute from '@components/ProtectedRoute';
import '@styles/styles.css';

//Importado de las paginas de alumno
import MisElectivos from '@pages/MisElectivos';
import GestionPeriodos from '@pages/GestionPeriodos';
import InscripcionEspecial from '@pages/InscripcionEspecial';
import { getAllPeriods, addElectivesToPeriod } from '@services/registrationperiod.service';
import { getAllElectives } from '@services/elective.service';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root/>,
    errorElement: <Error404/>,
    children: [
      {
        index: true,
        element: <Home/> 
      },
      {
        path: '/home',
        element: <Home/>
      },
      {
        path: '/users',
        element: (
        <ProtectedRoute allowedRoles={['administrador']}>
          <Users />
        </ProtectedRoute>
        ),
      },
      {
        path: "/mis-electivos",
        element: (
          <ProtectedRoute allowedRoles={["Alumno"]}>
            <MisElectivos />
          </ProtectedRoute>
          )
        },
        {
          path: "/gestion-periodos",
          element: (
            <ProtectedRoute allowedRoles={["administrador"]}>
              <GestionPeriodos />
            </ProtectedRoute>
          )
        }
    ]
  },
  {
    path: '/auth',
    element: <Login/>
  },
  {
    path: '/register',
    element: <Register/>
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router}/>
)