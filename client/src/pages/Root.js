import { Outlet } from 'react-router-dom';

import '../App.css';

function RootLayout() {
  return (
    <div className='App'>
      <Outlet />
    </div>
  );
}

export default RootLayout;
