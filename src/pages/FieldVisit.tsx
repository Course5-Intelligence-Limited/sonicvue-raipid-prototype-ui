"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import {
  Box,
  Typography,
  MenuItem,
  Select,
  type SelectChangeEvent,
  FormControl,
  Paper,
  styled,
  CircularProgress,
  Container,
  Alert,
} from "@mui/material"
import { Phone, BarChart as BarChartIcon, Percent, AttachMoney, Warning, Speed } from "@mui/icons-material"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

// Styled components
const StyledSelect = styled(Select)({
  height: "36px",
  backgroundColor: "white",
  borderRadius: "6px",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#E5E7EB",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#E5E7EB",
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#6C2BD9",
  },
})

// KPI Card component
const KPICard = ({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) => (
  <Paper
    elevation={0}
    sx={{
      p: 1.5,
      border: "1px solid #E5E7EB",
      borderRadius: "6px",
      display: "flex",
      alignItems: "flex-start",
      gap: 1.5,
      height: "100%",
      minHeight: "80px",
    }}
  >
    <Box
      sx={{
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        backgroundColor: "rgba(108, 43, 217, 0.1)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0, // Prevent the circle from shrinking
        minWidth: "32px", // Ensure minimum width
        minHeight: "32px", // Ensure minimum height
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography variant="h6" sx={{ fontSize: "18px", fontWeight: 600, mb: 0.5 }}>
        {value}
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: "12px" }}>
        {label}
      </Typography>
    </Box>
  </Paper>
)

// Colors for charts
const COLORS = ["#6800E0", "#1E88E5"]

// API response interface
interface ApiResponse {
  totalCalls: number
  totalFieldVisits: number
  fieldAttachRate: number
  totalCost: number
  unnecessaryVisitsCost: number
  percentageOfCruTaggedAsFru: number
  visitsRequiredPercentage: number
  visitsNotRequiredPercentage: number
  cruNumber: number
  fruNumber: number
  necessaryVisitsCostPercentage: number
  unnecessaryVisitsCostPercentage: number
}

// Dashboard data interface
interface FieldVisitData {
  totalCalls: number
  totalFieldVisits: number
  fieldAttachRate: number
  totalCost: number
  unnecessaryVisitsCost: number
  cruTaggedAsFruPercentage: number
  visitRequiredPercentage: number
  visitNotRequiredPercentage: number
  customerReplaceable: number
  fieldReplaceable: number
  necessaryVisitsCostPercentage: number
  unnecessaryVisitsCostPercentage: number
}

export default function FieldVisitDashboard(): React.ReactElement {
  const [year, setYear] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<FieldVisitData | null>(null)

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Build request body based on selected filters
      const requestBody: { year?: string; category?: string } = {}
      if (year) requestBody.year = year
      if (category) requestBody.category = category

      const response = await axios.post("http://172.203.229.218:8080/field-visit", requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      // Map API response to dashboard data structure
      const apiData: ApiResponse = response.data
      setDashboardData({
        totalCalls: apiData.totalCalls,
        totalFieldVisits: apiData.totalFieldVisits,
        fieldAttachRate: apiData.fieldAttachRate,
        totalCost: apiData.totalCost,
        unnecessaryVisitsCost: apiData.unnecessaryVisitsCost,
        cruTaggedAsFruPercentage: apiData.percentageOfCruTaggedAsFru,
        visitRequiredPercentage: apiData.visitsRequiredPercentage,
        visitNotRequiredPercentage: apiData.visitsNotRequiredPercentage,
        customerReplaceable: apiData.cruNumber,
        fieldReplaceable: apiData.fruNumber,
        necessaryVisitsCostPercentage: apiData.necessaryVisitsCostPercentage,
        unnecessaryVisitsCostPercentage: apiData.unnecessaryVisitsCostPercentage,
      })
    } catch (err) {
      console.error("Error fetching field visit data:", err)
      setError("Failed to fetch data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on initial load and when filters change
  useEffect(() => {
    fetchData()
  }, [year, category])

  const handleSelectChange =
    (setState: React.Dispatch<React.SetStateAction<string>>) => (event: SelectChangeEvent<unknown>) => {
      setState(event.target.value as string)
    }

  // Generate KPI cards data from API response
  const getKpiData = () => {
    if (!dashboardData) return []

    return [
      {
        icon: <Phone sx={{ color: "#6C2BD9", fontSize: "18px" }} />,
        value: dashboardData.totalCalls.toString(),
        label: "Total Calls",
      },
      {
        icon: <BarChartIcon sx={{ color: "#6C2BD9", fontSize: "18px" }} />,
        value: dashboardData.totalFieldVisits.toString(),
        label: "Total Field Visits",
      },
      {
        icon: <Speed sx={{ color: "#6C2BD9", fontSize: "18px" }} />,
        value: `${dashboardData.fieldAttachRate}`,
        label: "Field Attach Rate",
      },
      {
        icon: <AttachMoney sx={{ color: "#6C2BD9", fontSize: "18px" }} />,
        value: `$${dashboardData.totalCost}`,
        label: "Total Cost",
      },
      {
        icon: <AttachMoney sx={{ color: "#6C2BD9", fontSize: "18px" }} />,
        value: `$${dashboardData.unnecessaryVisitsCost}`,
        label: "Cost of unnecessary visits",
      },
      {
        icon: <Warning sx={{ color: "#6C2BD9", fontSize: "18px" }} />,
        value: `${dashboardData.cruTaggedAsFruPercentage.toFixed(1)}%`,
        label: "% of CRU were tagged as FRU",
      },
    ]
  }

  // Chart data for Field Visit Required / Not Required
  const getVisitRequiredData = () => {
    if (!dashboardData) return []
    return [
      { name: "", value: dashboardData.visitNotRequiredPercentage },
      { name: "", value: dashboardData.visitRequiredPercentage },
    ]
  }

  // Chart data for Cost
  const getCostData = () => {
    if (!dashboardData) return []
    return [
      { name: "", value: dashboardData.unnecessaryVisitsCostPercentage },
      { name: "", value: dashboardData.necessaryVisitsCostPercentage },
    ]
  }

  // Chart data for CRU / FRU
  const getCruFruData = () => {
    if (!dashboardData) return []
    return [
      { name: "Customer Replaceable", value: dashboardData.customerReplaceable },
      { name: "Field Replaceable", value: dashboardData.fieldReplaceable },
    ]
  }

  // Calculate Y-axis ticks for CRU/FRU chart
  const getYAxisTicks = () => {
    if (!dashboardData) return [0]

    const maxValue = Math.max(dashboardData.customerReplaceable, dashboardData.fieldReplaceable)
    const tickCount = 5 // Number of ticks to display
    const maxTickValue = Math.ceil(maxValue * 1.2) // Add 20% padding

    // Generate array of evenly spaced whole number ticks
    const ticks = []
    const step = Math.ceil(maxTickValue / (tickCount - 1))

    for (let i = 0; i < tickCount; i++) {
      ticks.push(i * step)
    }

    return ticks
  }

  // Custom label renderer for pie chart
  const renderCustomizedLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, index, name } = props
    const RADIAN = Math.PI / 180
    const radius = outerRadius * 1.1
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text x={x} y={y} fill="#000000" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize="12px">
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      <Container maxWidth={false} sx={{ py: 2, px: 1, maxWidth: "100%", margin: "0 auto" }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            bgcolor: "#6800E0",
            height: "36px",
            color: "white",
            fontSize: "15px",
            p: 1.5,
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            gap: 0.8,
          }}
        >
          <BarChartIcon sx={{ fontSize: "18px" }} />
          Field Visit
        </Typography>

        {/* Filters */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: 1.5,
            mb: 2,
            alignItems: { xs: "stretch", lg: "center" },
            justifyContent: "space-between",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
              flexWrap: { sm: "wrap", lg: "nowrap" },
            }}
          >
            <FormControl sx={{ minWidth: { xs: "100%", sm: 180 } }}>
              <StyledSelect value={year} onChange={handleSelectChange(setYear)} displayEmpty>
                <MenuItem value="">Year</MenuItem>
                <MenuItem value="2025">2025</MenuItem>
                <MenuItem value="2024">2024</MenuItem>
                <MenuItem value="2023">2023</MenuItem>
              </StyledSelect>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: "100%", sm: 180 } }}>
              <StyledSelect value={category} onChange={handleSelectChange(setCategory)} displayEmpty>
                <MenuItem value="">Category</MenuItem>
                <MenuItem value="healthcare">Healthcare</MenuItem>
                <MenuItem value="hardware">Hardware</MenuItem>
                <MenuItem value="software">Software</MenuItem>
                <MenuItem value="network">Network</MenuItem>
              </StyledSelect>
            </FormControl>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress sx={{ color: "#6C2BD9" }} />
          </Box>
        ) : dashboardData ? (
          <>
            {/* KPI Cards */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 1.5,
                mb: 3,
              }}
            >
              {getKpiData().map((kpi, index) => (
                <KPICard key={index} {...kpi} />
              ))}
            </Box>

            {/* Charts */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
                gap: 2,
                mb: 3,
              }}
            >
              {/* Field Visit Required / Not Required */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  height: "100%",
                }}
              >
                <Typography variant="h6" sx={{ mb: 1, fontSize: "15px", fontWeight: 500 }}>
                  Field Visit Required / Not Required
                </Typography>
                <Box sx={{ height: 300, position: "relative" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getVisitRequiredData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        innerRadius={50}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getVisitRequiredData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center text */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {dashboardData.visitRequiredPercentage.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption">Visit Required</Typography>
                  </Box>

                  {/* Legend */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      display: "flex",
                      justifyContent: "center",
                      gap: 4,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: "#6800E0",
                        }}
                      />
                      <Typography variant="body2">Visit Not Required</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: "#1E88E5",
                        }}
                      />
                      <Typography variant="body2">Visit Required</Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>

              {/* CRU / FRU */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  height: "100%",
                }}
              >
                <Typography variant="h6" sx={{ mb: 1, fontSize: "15px", fontWeight: 500 }}>
                  CRU / FRU
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getCruFruData()} barSize={40}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} ticks={getYAxisTicks()} allowDecimals={false} />
                      <Tooltip formatter={(value) => [value, "Value"]} />
                      <Bar dataKey="value" fill="#6800E0" radius={[4, 4, 0, 0]}>
                        {getCruFruData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill="#6800E0" />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>

              {/* Cost */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  border: "1px solid #E5E7EB",
                  borderRadius: "6px",
                  height: "100%",
                }}
              >
                <Typography variant="h6" sx={{ mb: 1, fontSize: "15px", fontWeight: 500 }}>
                  Cost
                </Typography>
                <Box sx={{ height: 300, position: "relative" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getCostData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        innerRadius={50}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getCostData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Center text */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      ${dashboardData.totalCost}
                    </Typography>
                    <Typography variant="caption">Total</Typography>
                  </Box>

                  {/* Legend */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      display: "flex",
                      justifyContent: "center",
                      gap: 4,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: "#6800E0",
                        }}
                      />
                      <Typography variant="body2">Unnecessary Visits</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: "#1E88E5",
                        }}
                      />
                      <Typography variant="body2">Necessary Visits</Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </>
        ) : null}
      </Container>
    </Box>
  )
}
