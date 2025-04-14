"use client"

import type React from "react"
import { useContext } from "react"
import { AppBar, Toolbar, Typography, IconButton, Avatar, Button } from "@mui/material"
import { Logout } from "@mui/icons-material"
import c5ilogo from "../images/c5i_logo.png"
import UploadFileIcon from "@mui/icons-material/UploadFile"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"

interface HeaderProps {
  onLogout: () => void
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)

  // Get the first letter of the username for the avatar
  const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : "?"

  const handleLogoClick = () => {
    navigate("/home")
  }

  return (
    <AppBar position="static" sx={{ height: "50px", backgroundColor: "white", color: "black" }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
          <img
            src={c5ilogo || "/placeholder.svg"}
            alt="C5i Logo"
            style={{ height: "30px", marginRight: "10px", marginBottom: "10px", cursor: "pointer" }}
            onClick={handleLogoClick}
          />
        </Typography>
        <Button
          sx={{
            height: "30px",
            width: "30px",
            bgcolor: "#0c0c0c",
            fontSize: "10px",
            marginBottom: "10px",
            marginRight: "20px",
          }}
          variant="contained"
          onClick={() => navigate("/upload")}
        >
          <UploadFileIcon sx={{ height: "15px" }} />
        </Button>
        <Avatar sx={{ height: "25px", width: "25px", bgcolor: "#6800E0", marginBottom: "10px", fontSize: "12px" }}>
          {userInitial}
        </Avatar>
        <IconButton onClick={onLogout} sx={{ marginBottom: "10px" }} color="inherit">
          <Logout sx={{ height: "20px" }} />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

export default Header
