"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material"
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined"
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined"
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined"
import BarChartIcon from "@mui/icons-material/BarChart"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import axios from "axios"
import { useUpload } from "../context/FileContext" // Import the same context used in upload page

const HomePage: React.FC = () => {
  const navigate = useNavigate()
  const { files } = useUpload() // Use the same context as upload page
  const [insights, setInsights] = useState<string[]>([])
  const [loadingInsights, setLoadingInsights] = useState(false)

  const cards = [
    {
      title: "Call Analysis",
      icon: <AssignmentOutlinedIcon sx={{ fontSize: 32, color: "#8000ff" }} />,
      description: "Insights on call performance and customer tone",
      route: "/dashboard",
    },
    {
      title: "Agent Performance",
      icon: <HeadsetMicOutlinedIcon sx={{ fontSize: 32, color: "#8000ff" }} />,
      description: "Metrics on agent efficiency and improvement areas",
      route: "/agent",
    },
    {
      title: "Parts Dispatched",
      icon: <LocalShippingOutlinedIcon sx={{ fontSize: 32, color: "#8000ff" }} />,
      description: "Tracking parts and supply chain efficiency",
      route: "/parts",
    },
    {
      title: "Field visit",
      icon: <BarChartIcon sx={{ fontSize: 32, color: "#8000ff" }} />,
      description: "Analyze and improve customer satisfaction scores",
      route: "/field",
    },
  ]

  // Default dummy insights when no files are uploaded
  const defaultInsights = [
    "Enhance customer satisfaction with data-driven insights",
    "Optimize agent performance through real-time analytics",
    "Streamline operations with intelligent dispatch management",
  ]

  // Function to fetch insights from backend
  const fetchInsights = async (fileList: string[]) => {
    setLoadingInsights(true)
    try {
      console.log("Fetching insights for files:", fileList) // Debug log

      const response = await axios.post(
        "http://172.203.229.218:8080/landing-insights",
        {
          file_list: fileList,
        },
        {
          headers: {
            "Content-Type": "application/json",
            clientId: "synct",
            clientSecret: "B5Ciz82LRM",
          },
        },
      )

      console.log("API Response:", response.data) // Debug log

      if (response.data && response.data.insights) {
        // Parse the insights string to extract bullet points
        const insightsText = response.data.insights
        const lines = insightsText.split("\n")
        const bulletPoints: string[] = []

        lines.forEach((line: string) => {
          const trimmedLine = line.trim()
          if (trimmedLine.startsWith("- ")) {
            // Remove the "- " prefix and add to bullet points
            bulletPoints.push(trimmedLine.substring(2))
          }
        })

        console.log("Parsed bullet points:", bulletPoints) // Debug log

        if (bulletPoints.length > 0) {
          setInsights(bulletPoints)
        } else {
          // If no bullet points found, use the default insights
          setInsights(defaultInsights)
        }
      } else {
        setInsights(defaultInsights)
      }
    } catch (error) {
      console.error("Error fetching insights:", error)
      // Use default insights on error
      setInsights(defaultInsights)
    } finally {
      setLoadingInsights(false)
    }
  }

  useEffect(() => {
    // Get successfully uploaded files
    const uploadedFiles = files.filter((file) => file.status === "success").map((file) => file.file.name)

    console.log("Uploaded files found:", uploadedFiles) // Debug log

    if (uploadedFiles.length > 0) {
      // Fetch insights if files are uploaded
      fetchInsights(uploadedFiles)
    } else {
      // Use default insights if no files uploaded
      console.log("No uploaded files found, using default insights") // Debug log
      setInsights(defaultInsights)
    }
  }, [files]) // Re-run when files change

  const handleCardClick = (route: string) => {
    navigate(route)
  }

  return (
    <Box sx={{ p: 3 }}>
      <Container maxWidth="xl">
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
          <Typography sx={{ marginBottom: "20px", marginRight: "5px", color: "#6800E0", fontWeight: 600 }}>
            Welcome
          </Typography>
          <Typography sx={{ marginBottom: "20px", color: "#6800E0", fontWeight: 600 }}>!</Typography>
        </Typography>
        <Grid container spacing={2}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "10px",
                  overflow: "visible",
                  cursor: "pointer",
                  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  },
                }}
                onClick={() => handleCardClick(card.route)}
              >
                <Box
                  sx={{
                    bgcolor: "#2a0066",
                    color: "white",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                    position: "relative",
                    height: "80px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderBottom: "4px solid #8000ff",
                  }}
                >
                  <Typography variant="subtitle1" sx={{ fontSize: "15px", fontWeight: 600, textAlign: "center" }}>
                    {card.title}
                  </Typography>
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: "-24px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "48px",
                      height: "48px",
                      borderRadius: "50%",
                      bgcolor: "white",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    {card.icon}
                  </Box>
                </Box>
                <CardContent sx={{ flexGrow: 1, pt: 4, px: 2, pb: 2 }}>
                  <Typography variant="body2" align="center" sx={{ color: "#666", fontSize: "0.875rem" }}>
                    {card.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            mt: 4,
            mb: 2,
            p: 3,
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            border: 1,
            borderRadius: "8px",
            borderColor: "#C1C1C1",
          }}
        >
          <Typography sx={{ mb: 1, color: "#2a0066", fontSize: "16px", fontWeight: "bold", textAlign: "left" }}>
            Insights-based Actions:
          </Typography>
          {loadingInsights ? (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 2 }}>
              <CircularProgress size={24} sx={{ color: "#8000ff", mr: 2 }} />
              <Typography sx={{ color: "#666", fontSize: "14px" }}>Loading insights...</Typography>
            </Box>
          ) : (
            <List sx={{ maxWidth: "800px" }}>
              {insights.map((point, index) => (
                <ListItem key={index} sx={{ paddingTop: "1px", paddingBottom: "1px" }}>
                  <ListItemIcon sx={{ minWidth: "30px" }}>
                    <CheckCircleOutlineIcon sx={{ maxWidth: "20px", color: "#8000ff" }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={point}
                    primaryTypographyProps={{
                      sx: {
                        fontSize: "14px",
                        fontWeight: 500,
                        color: "#333",
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          )}

          {/* Debug info - remove this in production */}
          <Box sx={{ mt: 2, p: 1, bgcolor: "#f5f5f5", borderRadius: 1 }}>
            <Typography variant="caption" sx={{ color: "#666" }}>
              Debug: {files.length} total files, {files.filter((f) => f.status === "success").length} uploaded
              successfully
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default HomePage
