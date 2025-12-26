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

//Electivos
import Electives from '@pages/Electives';
import ElectiveForm from '@components/ElectiveForm';
import ElectiveDetail from '@pages/ElectiveDetail';
import JefeCarreraElectives from '@pages/JefeCarreraElectives';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root/>,
    errorElement: <Error404/>,
    children: [
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
                path: '/electives',
                element: <Electives/>
              },
              {
                path: '/all/list',
                element: <JefeCarreraElectives/>
              },
              {
                path: '/electives/new',
                element: (
                  <ProtectedRoute allowedRoles={["Profesor"]}>
                    <ElectiveForm isEdit={false}/>
                  </ProtectedRoute>
                )
              },
              {
                path: '/electives/:id/edit',
                element: (
                  <ProtectedRoute allowedRoles={["Profesor"]}>
                    <ElectiveForm isEdit={true}/>
                  </ProtectedRoute>
                )
              },
              {
                path: '/electives/:id',
                element: <ElectiveDetail/>
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