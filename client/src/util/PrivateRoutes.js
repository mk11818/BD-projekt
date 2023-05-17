import { Outlet, Navigate } from 'react-router-dom';

const PrivateRoutes = (props) => {
  console.log('private ->', props.isAuth);
  return props.isAuth ? <Outlet /> : <Navigate to='/' />;
};

export default PrivateRoutes;
