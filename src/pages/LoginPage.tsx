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

const OTPContainer = styled(Box)({
  display: "flex",
  gap: "10px",
  justifyContent: "center",
  marginBottom: "20px",
})

const OTPInput = styled(TextField)({
  width: "50px",
  "& .MuiOutlinedInput-root": {
    backgroundColor: "#F8F9FA",
    fontSize: "1.2rem",
    textAlign: "center",
    "& input": {
      textAlign: "center",
      padding: "12px 0",
    },
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

  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordStep, setForgotPasswordStep] = useState<"email" | "otp" | "reset" | "success">("email")
  const [forgotEmail, setForgotEmail] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)

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

  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendTimer])

  // Forgot password handlers
  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true)
    setForgotPasswordStep("email")
    setError("")
    setSuccess("")
  }

  const handleBackToLogin = () => {
    setShowForgotPassword(false)
    setForgotPasswordStep("email")
    setForgotEmail("")
    setOtp(["", "", "", "", "", ""])
    setNewPassword("")
    setConfirmPassword("")
    setError("")
    setSuccess("")
  }

  const handleForgotEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(forgotEmail)) {
      setError("Please enter a valid email address")
      return
    }

    try {
      // Simulate API call to send OTP
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSuccess("OTP sent to your email address")
      setOpenSnackbar(true)
      setForgotPasswordStep("otp")
      setResendTimer(60)
    } catch (err) {
      setError("Failed to send OTP. Please try again.")
    }
  }

  const handleOTPChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`)
        nextInput?.focus()
      }
    }
  }

  const handleOTPKeyDown = (index: number, event: React.KeyboardEvent) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleOTPSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const otpString = otp.join("")
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit OTP")
      return
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSuccess("OTP verified successfully")
      setOpenSnackbar(true)
      setForgotPasswordStep("reset")
    } catch (err) {
      setError("Invalid OTP. Please try again.")
    }
  }

  const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setForgotPasswordStep("success")
    } catch (err) {
      setError("Failed to reset password. Please try again.")
    }
  }

  const handleResendOTP = async () => {
    if (resendTimer > 0) return

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess("OTP resent to your email")
      setOpenSnackbar(true)
      setResendTimer(60)
      setOtp(["", "", "", "", "", ""])
    } catch (err) {
      setError("Failed to resend OTP. Please try again.")
    }
  }

  const renderForgotPasswordContent = () => {
    switch (forgotPasswordStep) {
      case "email":
        return (
          <Fade in={forgotPasswordStep === "email"}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Box component="span" onClick={handleBackToLogin} sx={{ cursor: "pointer", mr: 1, display: "flex" }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Forgot Password
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                <Box
                  sx={{ p: 3, borderRadius: 2, backgroundColor: "#F8F9FA", display: "flex", justifyContent: "center" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6800E0"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
                Enter your email address and we'll send you a 6-digit OTP to reset your password.
              </Typography>

              <Box component="form" onSubmit={handleForgotEmailSubmit} noValidate>
                <StyledTextField
                  margin="normal"
                  required
                  fullWidth
                  id="forgot-email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />

                <PrimaryButton type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 2 }}>
                  {loading ? "Sending OTP..." : "Send OTP"}
                </PrimaryButton>
              </Box>
            </Box>
          </Fade>
        )

      case "otp":
        return (
          <Fade in={forgotPasswordStep === "otp"}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Box
                  component="span"
                  onClick={() => setForgotPasswordStep("email")}
                  sx={{ cursor: "pointer", mr: 1, display: "flex" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Verify OTP
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                <Box
                  sx={{ p: 3, borderRadius: 2, backgroundColor: "#F8F9FA", display: "flex", justifyContent: "center" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6800E0"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
                We've sent a 6-digit OTP to <strong>{forgotEmail}</strong>. Please enter it below.
              </Typography>

              <Box component="form" onSubmit={handleOTPSubmit} noValidate>
                <OTPContainer>
                  {otp.map((digit, index) => (
                    <OTPInput
                      key={index}
                      id={`otp-${index}`}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      inputProps={{ maxLength: 1 }}
                    />
                  ))}
                </OTPContainer>

                <PrimaryButton type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 2 }}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </PrimaryButton>

                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Typography variant="body2" color="text.secondary">
                    Didn't receive the code?{" "}
                    <Typography
                      component="span"
                      color={resendTimer > 0 ? "text.disabled" : "#6800E0"}
                      sx={{ cursor: resendTimer > 0 ? "default" : "pointer" }}
                      onClick={handleResendOTP}
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Fade>
        )

      case "reset":
        return (
          <Fade in={forgotPasswordStep === "reset"}>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                <Box
                  component="span"
                  onClick={() => setForgotPasswordStep("otp")}
                  sx={{ cursor: "pointer", mr: 1, display: "flex" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Reset Password
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                <Box
                  sx={{ p: 3, borderRadius: 2, backgroundColor: "#F8F9FA", display: "flex", justifyContent: "center" }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6800E0"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </Box>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: "center" }}>
                Create a new password for your account.
              </Typography>

              <Box component="form" onSubmit={handlePasswordReset} noValidate>
                <StyledTextField
                  margin="normal"
                  required
                  fullWidth
                  name="newPassword"
                  label="New Password"
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Box
                          component="span"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          sx={{ cursor: "pointer" }}
                        >
                          {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                />

                <StyledTextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Box
                          component="span"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          sx={{ cursor: "pointer" }}
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                />

                <PrimaryButton type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 2 }}>
                  {loading ? "Resetting..." : "Reset Password"}
                </PrimaryButton>
              </Box>
            </Box>
          </Fade>
        )

      case "success":
        return (
          <Fade in={forgotPasswordStep === "success"}>
            <Box sx={{ textAlign: "center" }}>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                <Box
                  sx={{ p: 3, borderRadius: 2, backgroundColor: "#E8F5E8", display: "flex", justifyContent: "center" }}
                >
                  <Box sx={{ color: "#4CAF50", fontSize: "40px" }}>✓</Box>
                </Box>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 500, mb: 2 }}>
                Password Reset Successful!
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Your password has been successfully reset. You can now login with your new password.
              </Typography>

              <PrimaryButton fullWidth variant="contained" onClick={handleBackToLogin}>
                Back to Login
              </PrimaryButton>
            </Box>
          </Fade>
        )

      default:
        return null
    }
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
            {showForgotPassword ? "Reset Password" : isLogin ? "Welcome 👋" : "Create Account 👋"}
          </Typography>

          <Typography variant="h6" sx={{ color: "#6800E0", fontWeight: 600, mb: 1 }}>
            SonicVUE
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Reimagine your contact center with C5i's SonicVUE - where human empathy meets AI precision.
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

          {/* Forgot Password Flow */}
          {showForgotPassword ? (
            renderForgotPasswordContent()
          ) : (
            <>
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
                      {/* <Typography
                        variant="body2"
                        color="#6800E0"
                        sx={{ cursor: "pointer" }}
                        onClick={handleForgotPasswordClick}
                      >
                        Forgot Password?
                      </Typography> */}
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
            </>
          )}
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
