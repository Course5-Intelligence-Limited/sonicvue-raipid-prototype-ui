import React from 'react';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  onLogout: () => void; // Add onLogout prop here
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header onLogout={onLogout} /> {/* Pass onLogout to Header */}
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Box>
          <Sidebar />
        </Box>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {children}
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
