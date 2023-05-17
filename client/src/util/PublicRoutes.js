import { Outlet, Navigate } from 'react-router-dom';

const PublicRoutes = (props) => {
  console.log('public ->', !props.isAuth);
  return !props.isAuth ? <Outlet /> : <Navigate to='/dashboard' />;
};

export default PublicRoutes;
