"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, Box, Typography, LinearProgress, CircularProgress } from "@mui/material"
import { CheckCircle } from "@mui/icons-material"

interface MetricItem {
  name: string
  stage: "analyzing" | "calculating" | "generated"
  status: "pending" | "processing" | "completed"
}

interface DashboardLoadingPopupProps {
  isOpen: boolean
  onComplete: () => void
}

export function DashboardLoadingPopup({ isOpen, onComplete }: DashboardLoadingPopupProps) {
  const [metrics, setMetrics] = useState<MetricItem[]>([
    { name: "Total Calls Analysis", stage: "analyzing", status: "pending" },
    { name: "Parts Dispatch Tracking", stage: "analyzing", status: "pending" },
    { name: "Cost Distribution", stage: "analyzing", status: "pending" },
    { name: "Dispatch Rate Calculation", stage: "analyzing", status: "pending" },
    { name: "Parts Efficiency Metrics", stage: "analyzing", status: "pending" },
    { name: "Cost Optimization Analysis", stage: "analyzing", status: "pending" },
    { name: "Performance Insights", stage: "analyzing", status: "pending" },
    { name: "Actionable Recommendations", stage: "analyzing", status: "pending" },
    { name: "Dashboard Visualization", stage: "analyzing", status: "pending" },
  ])

  useEffect(() => {
    if (!isOpen) return

    // Reset metrics when popup opens
    setMetrics([
      { name: "Total Calls Analysis", stage: "analyzing", status: "pending" },
      { name: "Parts Dispatch Tracking", stage: "analyzing", status: "pending" },
      { name: "Cost Distribution", stage: "analyzing", status: "pending" },
      { name: "Dispatch Rate Calculation", stage: "analyzing", status: "pending" },
      { name: "Parts Efficiency Metrics", stage: "analyzing", status: "pending" },
      { name: "Cost Optimization Analysis", stage: "analyzing", status: "pending" },
      { name: "Performance Insights", stage: "analyzing", status: "pending" },
      { name: "Actionable Recommendations", stage: "analyzing", status: "pending" },
      { name: "Dashboard Visualization", stage: "analyzing", status: "pending" },
    ])

    const processMetrics = async () => {
      // Process each metric through all three stages
      for (let i = 0; i < metrics.length; i++) {
        // Stage 1: Analyzing (processing)
        await new Promise((resolve) => setTimeout(resolve, 300))
        setMetrics((prev) =>
          prev.map((metric, index) => (index === i ? { ...metric, stage: "analyzing", status: "processing" } : metric)),
        )

        // Stage 2: Calculating
        await new Promise((resolve) => setTimeout(resolve, 300))
        setMetrics((prev) =>
          prev.map((metric, index) =>
            index === i ? { ...metric, stage: "calculating", status: "processing" } : metric,
          ),
        )

        // Stage 3: Generated (completed)
        await new Promise((resolve) => setTimeout(resolve, 300))
        setMetrics((prev) =>
          prev.map((metric, index) => (index === i ? { ...metric, stage: "generated", status: "completed" } : metric)),
        )
      }

      // Wait a moment then close
      await new Promise((resolve) => setTimeout(resolve, 1000))
      onComplete()
    }

    processMetrics()
  }, [isOpen, onComplete])

  const getStageLabel = (stage: string, status: string) => {
    if (status === "completed") return "Generated..."

    switch (stage) {
      case "analyzing":
        return "Analyzing..."
      case "calculating":
        return "Calculating..."
      case "generated":
        return "Generated..."
      default:
        return "Analyzing..."
    }
  }

  const getStageColor = (stage: string, status: string) => {
    if (status === "completed") return "#10b981"

    switch (stage) {
      case "analyzing":
        return "#9ca3af"
      case "calculating":
        return "#60a5fa"
      case "generated":
        return "#10b981"
      default:
        return "#9ca3af"
    }
  }

  const renderIcon = (status: string, stage: string) => {
    if (status === "completed") {
      return <CheckCircle sx={{ color: "#10b981", fontSize: 16 }} />
    }

    if (status === "processing") {
      return (
        <CircularProgress
          size={16}
          sx={{
            color: getStageColor(stage, status),
          }}
        />
      )
    }

    return (
      <CircularProgress
        size={16}
        sx={{
          color: "#d1d5db",
        }}
        variant="determinate"
        value={0}
      />
    )
  }

  const completedCount = metrics.filter((m) => m.status === "completed").length
  const progressPercentage = (completedCount / metrics.length) * 100

  return (
    <Dialog
      open={isOpen}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 2,
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Header */}
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#1f2937", mb: 0.5, fontSize: "16px" }}>
              Preparing Your Parts Dispatch Dashboard...
            </Typography>
            <Typography variant="caption" sx={{ color: "#6b7280", fontSize: "11px" }}>
              Please hold on while we use AI to analyze your dispatch data and generate actionable insights.
            </Typography>
          </Box>

          {/* Progress Bar */}
          <Box>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "#e5e7eb",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#7c3aed",
                  borderRadius: 3,
                },
              }}
            />
          </Box>

          {/* Metrics List */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 500, color: "#7c3aed", mb: 1, fontSize: "11px" }}>
              We're processing the following metrics:
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {metrics.map((metric, index) => (
                <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {renderIcon(metric.status, metric.stage)}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ fontWeight: 500, color: "#1f2937", fontSize: "11px" }}>
                      {metric.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: getStageColor(metric.stage, metric.status),
                        ml: 0.5,
                        fontSize: "10px",
                      }}
                    >
                      {getStageLabel(metric.stage, metric.status)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  )
}
