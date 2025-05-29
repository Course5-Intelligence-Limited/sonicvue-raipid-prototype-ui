"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  MenuItem,
  Select,
  type SelectChangeEvent,
  FormControl,
  Button,
  Paper,
  styled,
  CircularProgress,
  Container,
  Alert,
} from "@mui/material"
import { Download, LocalShipping, Phone, AttachMoney, FormatListNumbered, Speed, Home } from "@mui/icons-material"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import axios from "axios"

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
interface PartsDispatchData {
  totalCalls: number
  totalPartsDispatched: number
  totalDispatchCost: number
  partsPerDispatch: number
  dispatchRate: number
  avgDispatchCost: number
  partsRequiredPercentage: number
  partsNotRequiredPercentage: number
  totalParts: number
  repeatedParts: number
  uniqueParts: number
  necessaryPartsCostPercentage: number
  unnecessaryPartsCostPercentage: number
}

export default function PartsDispatchedDashboard(): React.ReactElement {
  const [year, setYear] = useState<string>("")
  const [category, setCategory] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [dashboardData, setDashboardData] = useState<PartsDispatchData | null>(null)

  // Fetch data from API
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const requestBody = year ? { year } : {}
      const response = await axios.post("http://172.203.229.218:8082/parts-dispatch", requestBody, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      setDashboardData(response.data)
    } catch (err) {
      console.error("Error fetching parts dispatch data:", err)
      setError("Failed to fetch data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on initial load and when year changes
  useEffect(() => {
    fetchData()
  }, [year])

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
        icon: <LocalShipping sx={{ color: "#6C2BD9", fontSize: "18px" }} />,
        value: dashboardData.totalPartsDispatched.toString(),
        label: "Total Parts Dispatched",
      },
      {
        icon: <AttachMoney sx={{ color: "#6C2BD9", fontSize: "18px" }} />,
        value: `$${dashboardData.totalDispatchCost}`,
        label: "Total Dispatch Cost",
      },
      {
        icon: <FormatListNumbered sx={{ color: "#6C2BD9", fontSize: "18px" }} />,
        value: dashboardData.partsPerDispatch.toFixed(0),
        label: "Parts Per Dispatch",
      },
      {
        icon: <Speed sx={{ color: "#6C2BD9", fontSize: "18px" }} />,
        value: `${dashboardData.dispatchRate.toFixed(0)}%`,
        label: "Dispatch Rate",
      },
      {
        icon: <Home sx={{ color: "#6C2BD9", fontSize: "18px" }} />,
        value: `$${dashboardData.avgDispatchCost.toFixed(2)}`,
        label: "Average Dispatch Cost",
      },
    ]
  }

  // Chart data for Parts Required / Not Required
  const getPartsRequiredData = () => {
    if (!dashboardData) return []
    return [
      { name: "", value: dashboardData.partsNotRequiredPercentage },
      { name: "", value: dashboardData.partsRequiredPercentage },
    ]
  }

  // Chart data for Cost
  const getCostData = () => {
    if (!dashboardData) return []
    return [
      { name: "", value: dashboardData.necessaryPartsCostPercentage },
      { name: "", value: dashboardData.unnecessaryPartsCostPercentage },
    ]
  }

  // Chart data for Unique Parts
  const getUniquePartsData = () => {
    if (!dashboardData) return []
    return [
      { name: "Total Parts", value: dashboardData.totalParts },
      { name: "Repeated Parts", value: dashboardData.repeatedParts },
      { name: "Unique Parts", value: dashboardData.uniqueParts },
    ]
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
          <LocalShipping sx={{ fontSize: "18px" }} />
          Parts Dispatched
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
                <MenuItem value="">All Years</MenuItem>
                <MenuItem value="2025">2025</MenuItem>
                <MenuItem value="2024">2024</MenuItem>
                <MenuItem value="2023">2023</MenuItem>
              </StyledSelect>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: "100%", sm: 180 } }}>
              <StyledSelect value={category} onChange={handleSelectChange(setCategory)} displayEmpty>
                <MenuItem value="">All Categories</MenuItem>
                <MenuItem value="hardware">Hardware</MenuItem>
                <MenuItem value="software">Software</MenuItem>
                <MenuItem value="network">Network</MenuItem>
              </StyledSelect>
            </FormControl>
          </Box>
          {/* <Button
            variant="contained"
            startIcon={<Download sx={{ fontSize: "18px" }} />}
            sx={{
              bgcolor: "#7C3AED",
              "&:hover": {
                bgcolor: "#6D28D9",
              },
              textTransform: "none",
              minWidth: { xs: "100%", md: "auto" },
              borderRadius: "5px",
              height: "36px",
              fontSize: "13px",
              px: 2,
            }}
          >
            Download PDF
          </Button> */}
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
              {/* Parts Required / Not Required */}
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
                  Parts Required / Not Required
                </Typography>
                <Box sx={{ height: 300, position: "relative" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getPartsRequiredData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={80}
                        innerRadius={50}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {getPartsRequiredData().map((entry, index) => (
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
                      {dashboardData.partsNotRequiredPercentage.toFixed(0)}%
                    </Typography>
                    <Typography variant="caption">Not Required</Typography>
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
                      <Typography variant="body2">Parts Not Required</Typography>
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
                      <Typography variant="body2">Parts Required</Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>

              {/* Unique Parts */}
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
                  Unique Parts
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getUniquePartsData()} barSize={40}>
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis
                        tick={{ fontSize: 10 }}
                        domain={[
                          0,
                          Math.max(dashboardData.totalParts, dashboardData.repeatedParts, dashboardData.uniqueParts) *
                            1.2,
                        ]}
                      />
                      <Tooltip />
                      <Bar dataKey="value" fill="#6800E0" radius={[4, 4, 0, 0]}>
                        {getUniquePartsData().map((entry, index) => (
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
                      ${dashboardData.totalDispatchCost}
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
                      <Typography variant="body2">Necessary Parts</Typography>
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
                      <Typography variant="body2">Unnecessary Parts</Typography>
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
