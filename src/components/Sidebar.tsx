/*import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, ListItemButton } from '@mui/material';
import { Link } from 'react-router-dom';
import { CloudUpload, CloudUploadOutlined, InsertChartOutlined, ContactSupportOutlined, BarChart, QuestionAnswer } from '@mui/icons-material';


const Sidebar: React.FC = () => {
  return (
    <Box sx={{ width: '150px', backgroundColor: '#1a1a2e', color: 'white', height: '100%' }}>
      <List>
        <ListItemButton component={Link} to="/">
          <ListItemIcon sx={{ fontSize: '20px', minWidth: '30px', color: 'white' }}>
            <CloudUploadOutlined sx={{ fontSize: '20px' }} />
          </ListItemIcon>
          <ListItemText
            primary="Upload File"
            primaryTypographyProps={{ sx: { fontSize: '14px' } }}
          />
        </ListItemButton>
        <ListItemButton component={Link} to="/dashboard">
          <ListItemIcon sx={{ fontSize: '20px', minWidth: '30px', color: 'white' }}>
            <InsertChartOutlined sx={{ fontSize: '20px' }} />
          </ListItemIcon>
          <ListItemText
            primary="Call Analysis"
            primaryTypographyProps={{ sx: { fontSize: '14px' } }}
          />
        </ListItemButton>
        <ListItemButton component={Link} to="/chatbot">
          <ListItemIcon sx={{ fontSize: '20px', minWidth: '30px', color: 'white' }}>
            <ContactSupportOutlined sx={{ fontSize: '20px' }} />
          </ListItemIcon>
          <ListItemText
            primary="Support"
            primaryTypographyProps={{ sx: { fontSize: '14px' } }}
          />
        </ListItemButton>
      </List>

    </Box>
  );
};

export default Sidebar;*/

import React, { useState } from 'react';
import { Box, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import { CloudUploadOutlined, InsertChartOutlined, ContactSupportOutlined } from '@mui/icons-material';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import AllInboxOutlinedIcon from '@mui/icons-material/AllInboxOutlined';
import MenuOpenOutlinedIcon from '@mui/icons-material/MenuOpenOutlined';
import ShareLocationOutlinedIcon from '@mui/icons-material/ShareLocationOutlined';
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined"

const Sidebar: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  const handleMouseEnter = () => setExpanded(true);
  const handleMouseLeave = () => setExpanded(false);

  return (
    <Box
      sx={{
        width: expanded ? '200px' : '60px', // Sidebar width changes on hover
        backgroundColor: '#1a1a2e',
        color: 'white',
        height: '100%',
        transition: 'width 0.3s', // Smooth transition for expanding/collapsing
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <List>
        <ListItemButton sx={{ height: '50px' }} component={Link} to="/home">
          <ListItemIcon sx={{ fontSize: '20px', minWidth: '30px', color: 'white' }}>
            <MenuOpenOutlinedIcon sx={{ fontSize: '20px' }} />
          </ListItemIcon>
          {expanded && (
            <ListItemText sx={{ minWidth: '150px' }} primary="Home" primaryTypographyProps={{ sx: { fontSize: '14px' } }} />
          )}
        </ListItemButton>
        <ListItemButton sx={{ height: '50px' }} component={Link} to="/dashboard">
          <ListItemIcon sx={{ fontSize: '20px', minWidth: '30px', color: 'white' }}>
            <InsertChartOutlined sx={{ fontSize: '20px' }} />
          </ListItemIcon>
          {expanded && (
            <ListItemText sx={{ minWidth: '150px' }} primary="Call Analysis" primaryTypographyProps={{ sx: { fontSize: '14px' } }} />
          )}
        </ListItemButton>
        <ListItemButton sx={{ height: '50px' }} component={Link} to="/agent">
          <ListItemIcon sx={{ fontSize: '20px', minWidth: '30px', color: 'white' }}>
            <SupportAgentOutlinedIcon sx={{ fontSize: '20px' }} />
          </ListItemIcon>
          {expanded && (
            <ListItemText sx={{ minWidth: '150px' }} primary="Agent’s Performance" primaryTypographyProps={{ sx: { fontSize: '14px' } }} />
          )}
        </ListItemButton>
        <ListItemButton sx={{ height: '50px' }} component={Link} to="/parts">
          <ListItemIcon sx={{ fontSize: '20px', minWidth: '30px', color: 'white' }}>
            <AllInboxOutlinedIcon sx={{ fontSize: '20px' }} />
          </ListItemIcon>
          {expanded && (
            <ListItemText sx={{ minWidth: '150px' }} primary="Parts Dispatched" primaryTypographyProps={{ sx: { fontSize: '14px' } }} />
          )}
        </ListItemButton>
        <ListItemButton sx={{ height: '50px' }} component={Link} to="/dashboard">
          <ListItemIcon sx={{ fontSize: '20px', minWidth: '30px', color: 'white' }}>
            <ShareLocationOutlinedIcon sx={{ fontSize: '20px' }} />
          </ListItemIcon>
          {expanded && (
            <ListItemText sx={{ minWidth: '150px' }} primary="Field Visit" primaryTypographyProps={{ sx: { fontSize: '14px' } }} />
          )}
        </ListItemButton>
        <ListItemButton sx={{ height: '50px' }} component={Link} to="/dashboard">
          <ListItemIcon sx={{ fontSize: '20px', minWidth: '30px', color: 'white' }}>
            <TravelExploreOutlinedIcon sx={{ fontSize: '20px' }} />
          </ListItemIcon>
          {expanded && (
            <ListItemText sx={{ minWidth: '150px' }} primary="CS Portal" primaryTypographyProps={{ sx: { fontSize: '14px' } }} />
          )}
        </ListItemButton>
      </List>
    </Box>
  );
};

export default Sidebar;


