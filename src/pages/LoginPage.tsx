"use client"

import type React from "react"
import { useState, useContext, useEffect } from "react"
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  CssBaseline,
  InputAdornment,
  Fade,
  Alert,
  Snackbar,
} from "@mui/material"
import { styled } from "@mui/material/styles"
import { Eye, EyeOff } from "lucide-react"
import { AuthContext } from "../context/AuthContext"
import c5iLogo from "../images/c5i_logo.png"
import backgroundImage from "../images/cover3.jpg"

const StyledContainer = styled(Container)({
  display: "flex",
  minHeight: "100vh",
  padding: 0,
  maxWidth: "1400px !important",
  margin: "0 auto",
})

const FormSection = styled(Box)({
  flex: 1,
  padding: "20px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  maxWidth: "500px",
  marginRight: "120px",
})

const ImageSection = styled(Box)({
  flex: 1,
  position: "relative",
  overflow: "hidden",
  "& img": {
    borderRadius: "10px",
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
})

const StyledTextField = styled(TextField)({
  marginBottom: "15px",
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#F8F9FA",
    fontSize: "0.9rem",
  },
})

const PrimaryButton = styled(Button)({
  backgroundColor: "#6800E0",
  height: "40px",
  color: "white",
  padding: "10px 0",
  fontSize: "0.9rem",
  "&:hover": {
    backgroundColor: "#420897",
  },
})

const LoginPage: React.FC = () => {
  const { login, signup, error: authError, clearError, loading } = useContext(AuthContext)

  // State to toggle between login and signup
  const [isLogin, setIsLogin] = useState(true)

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Signup form state
  const [username, setUsername] = useState("")
  const [signupEmail, setSignupEmail] = useState("")
  const [signupPassword, setSignupPassword] = useState("")
  const [showSignupPassword, setShowSignupPassword] = useState(false)

  // Common state
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [openSnackbar, setOpenSnackbar] = useState(false)

  // Clear errors when switching forms
  useEffect(() => {
    clearError()
    setError("")
    setSuccess("")
  }, [isLogin, clearError])

  // Set local error if auth context has an error
  useEffect(() => {
    if (authError) {
      setError(authError)
    }
  }, [authError])

  // Toggle between login and signup forms
  const toggleAuthMode = () => {
    setIsLogin(!isLogin)
    clearError()
    setError("")
    setSuccess("")
  }

  // Handle login form submission
  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    // Basic validation
    if (!loginEmail || !loginPassword) {
      setError("Email and password are required")
      return
    }

    try {
      await login(loginEmail, loginPassword)
      // No need to redirect - the protected route in App.tsx will handle this
    } catch (err: any) {
      // The error is already set in the context and will be displayed via the useEffect
      // No need to do anything else here
    }
  }

  // Handle signup form submission
  const handleSignupSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setSuccess("")

    // Basic validation
    if (!username || !signupEmail || !signupPassword) {
      setError("All fields are required")
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(signupEmail)) {
      setError("Please enter a valid email address")
      return
    }

    try {
      await signup(username, signupEmail, signupPassword)

      // Set success message and open snackbar
      setSuccess("Account created successfully! Please login.")
      setOpenSnackbar(true)

      // Clear signup form
      setUsername("")
      setSignupEmail("")
      setSignupPassword("")

      // Switch to login form after a short delay
      setTimeout(() => {
        setIsLogin(true)
      }, 2000)
    } catch (err: any) {
      // Error is already set in the context
    }
  }

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false)
  }

  return (
    <StyledContainer>
      <CssBaseline />
      <FormSection>
        <Box sx={{ maxWidth: 350, width: "100%", mx: "auto" }}>
          <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
            <img src={c5iLogo || "/placeholder.svg"} alt="C5i Logo" style={{ height: "40px", marginRight: "10px" }} />
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 500, mb: 1 }}>
            {isLogin ? "Welcome 👋" : "Create Account 👋"}
          </Typography>

          <Typography variant="h6" sx={{ color: "#6800E0", fontWeight: 600, mb: 1 }}>
            SonicVUE
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Harness the Power of Gen-AI for Unmatched Insights and Elevate your customer service game
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* Login Form */}
          {isLogin && (
            <Fade in={isLogin}>
              <Box component="form" onSubmit={handleLoginSubmit} noValidate>
                <StyledTextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />

                <StyledTextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showLoginPassword ? "text" : "password"}
                  id="password"
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Box
                          component="span"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          sx={{ cursor: "pointer" }}
                        >
                          {showLoginPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                  <Typography variant="body2" color="#6800E0" sx={{ cursor: "pointer" }}>
                    Forgot Password?
                  </Typography>
                </Box>

                <PrimaryButton type="submit" fullWidth variant="contained" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </PrimaryButton>
              </Box>
            </Fade>
          )}

          {/* Signup Form */}
          {!isLogin && (
            <Fade in={!isLogin}>
              <Box component="form" onSubmit={handleSignupSubmit} noValidate>
                <StyledTextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />

                <StyledTextField
                  margin="normal"
                  required
                  fullWidth
                  id="signup-email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                />

                <StyledTextField
                  margin="normal"
                  required
                  fullWidth
                  name="signup-password"
                  label="Password"
                  type={showSignupPassword ? "text" : "password"}
                  id="signup-password"
                  autoComplete="new-password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Box
                          component="span"
                          onClick={() => setShowSignupPassword(!showSignupPassword)}
                          sx={{ cursor: "pointer" }}
                        >
                          {showSignupPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ mt: 2 }}>
                  <PrimaryButton type="submit" fullWidth variant="contained" disabled={loading}>
                    {loading ? "Signing up..." : "Sign up"}
                  </PrimaryButton>
                </Box>
              </Box>
            </Fade>
          )}

          {/* Toggle between login and signup */}
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2">
              {isLogin ? "Don't you have an account?" : "Already have an account?"}{" "}
              <Typography component="span" color="#6800E0" sx={{ cursor: "pointer" }} onClick={toggleAuthMode}>
                {isLogin ? "Sign up" : "Sign in"}
              </Typography>
            </Typography>
          </Box>
        </Box>
      </FormSection>

      <ImageSection sx={{ padding: "20px" }}>
        <img
          src={backgroundImage || "/placeholder.svg"}
          alt="AI Concept Testing"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </ImageSection>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message="Account created successfully! Please login."
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    </StyledContainer>
  )
}

export default LoginPage
