"use client"

import type React from "react"
import { useState, useEffect, useContext } from "react"
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  styled,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Alert,
  AlertTitle,
  Button,
} from "@mui/material"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { InsertChartOutlined, Close, TextSnippet, GetApp } from "@mui/icons-material"
import axios from "axios"
import TtyOutlinedIcon from "@mui/icons-material/TtyOutlined"
import AirlineStopsOutlinedIcon from "@mui/icons-material/AirlineStopsOutlined"
import ConnectWithoutContactOutlinedIcon from "@mui/icons-material/ConnectWithoutContactOutlined"
import PhonePausedOutlinedIcon from "@mui/icons-material/PhonePausedOutlined"
import AccessTimeSharpIcon from '@mui/icons-material/AccessTimeSharp';
import MoveUpOutlinedIcon from "@mui/icons-material/MoveUpOutlined"
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined"
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined"
import { useUpload } from "../context/FileContext"
import { AuthContext } from "../context/AuthContext"

const COLORS = ["#5ED061", "#EA4D4D", "#00308F", "#FF8042"]
const colors = ["#1877F2", "#3457D5", "#00308F"]

interface DashboardData {
  summary: {
    total_calls: number
    call_routing_accuracy: number
    multiple_agents: number
    call_hold_percentage: number
    call_hold_time: number
    escalated_calls: number
    resolution_confirmation: number
    cs_portal_recommended: number
  }
  complexity: {
    easy: number
    intermediate: number
    difficult: number
  }
  call_hygiene: {
    greeting: number
    phone_number: number
    email: number
  }
  tone_conversation: {
    positive: number
    negative: number
  }
  event_type: {
    [key: string]: number
  }
  root_cause_analysis: {
    hold_time: number
    resolution_time: number
    route_time: number
    call_time : number
    other_time : number
  }
  customer_service: {
    parts_request: number
    digital_service: number
    field_visits: number
  }
}

interface TableData {
  [key: string]: string | number | boolean | undefined
  filename?: string
  call_time?: string
  hold_time?: string
  route_time?: string
  resolution_time?: string
  greeting?: string
  phone_number?: string
  email_address?: string
  call_quality?: string
  resolution_confirmation?: string
  hold?: string
  hold_satisfaction?: string
  multiple_agents?: string
  escalation?: string
  call_tone?: string
  issue_discussed?: string
  complexity?: string
  issue_type?: string
  status_query?: string
  call_type?: string
  part_request?: string
  parts_dispatch?: string
  field_service?: string
  digital_service?: string
  transcript?: string
}

interface TableColumn {
  key: string
  label: string
  width: string
  backgroundColor: string
  color: string
}

const StyledTableCell = styled(TableCell)<{ config: TableColumn }>(({ theme, config }) => ({
  backgroundColor: config.backgroundColor,
  color: config.color,
  width: config.width,
  padding: theme.spacing(1),
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  fontWeight: "bold",
  textTransform: "uppercase",
  fontSize: "0.75rem",
  letterSpacing: "0.05em",
}))

const DataTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1),
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
}))

// Utility function to safely convert values to numbers
const safeNumber = (value: any): number => {
  if (value === null || value === undefined) return 0
  if (typeof value === "number") return isNaN(value) ? 0 : value
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value)
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

// Utility function to safely format numbers
const formatNumber = (value: any, decimals = 0): string => {
  const num = safeNumber(value)
  return num.toFixed(decimals)
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, fill }: any) => {
  const RADIAN = Math.PI / 180
  const radius = outerRadius * 1.2
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  const lineX1 = cx + outerRadius * 0.95 * Math.cos(-midAngle * RADIAN)
  const lineY1 = cy + outerRadius * 0.95 * Math.sin(-midAngle * RADIAN)
  const lineX2 = cx + outerRadius * 1.1 * Math.cos(-midAngle * RADIAN)
  const lineY2 = cy + outerRadius * 1.1 * Math.sin(-midAngle * RADIAN)

  return (
    <g>
      <line x1={lineX1} y1={lineY1} x2={lineX2} y2={lineY2} stroke={fill} strokeWidth={1} />
      <text x={x} y={y} fill={fill} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize="12px">
        {`${name} ${formatNumber(percent * 100, 0)}%`}
      </text>
    </g>
  )
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [tableData, setTableData] = useState<TableData[]>([])
  const [activeFilter, setActiveFilter] = useState<{ category: string; value: string } | null>(null)
  const [modality, setModality] = useState("All")
  const [complexity, setComplexity] = useState("All")
  const [eventType, setEventType] = useState("All")
  const [loading, setLoading] = useState(true)
  const [tableLoading, setTableLoading] = useState(true)
  const [openTranscriptDialog, setOpenTranscriptDialog] = useState(false)
  const [selectedTranscript, setSelectedTranscript] = useState("")
  const [selectedFilename, setSelectedFilename] = useState("")
  const [alert, setAlert] = useState({ show: false, message: "", type: "info" })
  const [error, setError] = useState<string | null>(null)

  const { files } = useUpload()
  const { getAuthToken } = useContext(AuthContext)

  // Check if all data is loaded
  const isAllDataLoaded = !loading && !tableLoading && dashboardData !== null

  const demoFiles = [
    "field_visit_1.mp3",
    "parts_dispatch_1.mp3",
    "call_efficiency_2.mp3",
    "call_efficiency_1.mp3",
    "call_efficiency_3.mp3",
  ]

  const getFileList = () => {
    const uploadedFiles = files.filter((f) => f.status === "success").map((f) => f.file.name)
    return uploadedFiles.length > 0 ? uploadedFiles : demoFiles
  }

  useEffect(() => {
    fetchDashboardData()
    fetchTableData()
  }, [modality, complexity, eventType, files])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = getAuthToken()

      if (!token) {
        setError("Authentication token not found. Please log in again.")
        setLoading(false)
        return
      }

      const requestBody: {
        file_list: string[]
        complexity?: string
        eventType?: string
        modality?: string
      } = {
        file_list: getFileList(),
      }

      if (modality !== "All") requestBody.modality = modality
      if (complexity !== "All") requestBody.complexity = complexity === "Medium" ? "Intermediate" : complexity
      if (eventType !== "All") requestBody.eventType = eventType

      const response = await axios.post("http://172.203.229.218:8080/dashboard-data", requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          clientId: "synct",
          clientSecret: "B5Ciz82LRM",
        },
      })

      setDashboardData(response.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setDashboardData(null)
      setError("Failed to load dashboard data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchTableData = async () => {
    setTableLoading(true)
    try {
      setError(null)
      const token = getAuthToken()

      if (!token) {
        setError("Authentication token not found. Please log in again.")
        setTableLoading(false)
        return
      }

      const requestBody = {
        file_list: getFileList(),
      }

      const response = await axios.post("http://172.203.229.218:8080/table-data", requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          clientId: "synct",
          clientSecret: "B5Ciz82LRM",
        },
      })

      setTableData(response.data || [])
    } catch (error) {
      console.error("Error fetching table data:", error)
      setTableData([])
      setError("Failed to load table data. Please try again.")
    } finally {
      setTableLoading(false)
    }
  }

  const applyFilter = (category: string, value: string) => {
    if (activeFilter?.category === category && activeFilter?.value === value) {
      setActiveFilter(null)
      setModality("All")
      setComplexity("All")
      setEventType("All")
    } else {
      setActiveFilter({ category, value })
      switch (category) {
        case "Modality":
          setModality(value)
          break
        case "Calls Complexity":
          setComplexity(value === "Medium" ? "Intermediate" : value)
          break
        case "Event Type":
          setEventType(value)
          break
      }
    }
  }

  const handleOpenTranscript = (transcript: string | undefined, filename: string) => {
    if (transcript) {
      setSelectedTranscript(transcript)
      setSelectedFilename(filename)
      setOpenTranscriptDialog(true)
    } else {
      setAlert({
        show: true,
        message: "No transcript available for this call.",
        type: "info",
      })
    }
  }

  const downloadTranscript = async () => {
    if (selectedTranscript && selectedFilename) {
      try {
        const element = document.createElement("a")
        const file = new Blob([selectedTranscript], { type: "text/plain" })
        element.href = URL.createObjectURL(file)
        element.download = `${selectedFilename.replace(/\.[^/.]+$/, "")}_transcript.txt`
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
        setAlert({
          show: true,
          message: "Transcript downloaded successfully.",
          type: "success",
        })
      } catch (error) {
        console.error("Error downloading transcript:", error)
        setAlert({
          show: true,
          message: "Error downloading transcript. Please try again.",
          type: "error",
        })
      }
    }
  }

  const columns: TableColumn[] = [
    { key: "filename", label: "File Name", width: "8%", backgroundColor: "#90a4ae", color: "#ffffff" },
    { key: "call_time", label: "Call Time (Sec)", width: "8%", backgroundColor: "#7C8F98", color: "#ffffff" },
    { key: "hold_time", label: "Hold Time (Sec)", width: "8%", backgroundColor: "#90a4ae", color: "#ffffff" },
    { key: "route_time", label: "Route Time (Sec)", width: "8%", backgroundColor: "#7C8F98", color: "#ffffff" },
    {
      key: "resolution_time",
      label: "Resolution Time (Sec)",
      width: "10%",
      backgroundColor: "#90a4ae",
      color: "#ffffff",
    },
    { key: "greeting", label: "Greeting (Y/N)", width: "10%", backgroundColor: "#7C8F98", color: "#ffffff" },
    {
      key: "phone_number",
      label: "Phone Number Collected (Y/N)",
      width: "10%",
      backgroundColor: "#90a4ae",
      color: "#ffffff",
    },
    {
      key: "email_address",
      label: "Email Address Collected (Y/N)",
      width: "15%",
      backgroundColor: "#7C8F98",
      color: "#ffffff",
    },
    { key: "call_quality", label: "Call Quality (%)", width: "8%", backgroundColor: "#90a4ae", color: "#ffffff" },
    {
      key: "resolution_confirmation",
      label: "Resolution Confirmation (Y/N)",
      width: "10%",
      backgroundColor: "#90a4ae",
      color: "#ffffff",
    },
    { key: "hold", label: "Hold", width: "5%", backgroundColor: "#7C8F98", color: "#ffffff" },
    {
      key: "hold_satisfaction",
      label: "Hold Satisfaction",
      width: "10%",
      backgroundColor: "#90a4ae",
      color: "#ffffff",
    },
    {
      key: "multiple_agents",
      label: "Multiple Agents (Y/N)",
      width: "10%",
      backgroundColor: "#7C8F98",
      color: "#ffffff",
    },
    { key: "escalation", label: "Escalation (Y/N)", width: "10%", backgroundColor: "#90a4ae", color: "#ffffff" },
    { key: "call_tone", label: "Call Tone", width: "10%", backgroundColor: "#7C8F98", color: "#ffffff" },
    { key: "issue_discussed", label: "Issue Discussed", width: "10%", backgroundColor: "#90a4ae", color: "#ffffff" },
    { key: "complexity", label: "Complexity", width: "10%", backgroundColor: "#7C8F98", color: "#ffffff" },
    { key: "issue_type", label: "Issue Type", width: "10%", backgroundColor: "#90a4ae", color: "#ffffff" },
    { key: "status_query", label: "Status Query", width: "10%", backgroundColor: "#7C8F98", color: "#ffffff" },
    { key: "call_type", label: "Call Type", width: "10%", backgroundColor: "#90a4ae", color: "#ffffff" },
    { key: "part_request", label: "Part Request (Y/N)", width: "10%", backgroundColor: "#90a4ae", color: "#ffffff" },
    {
      key: "parts_dispatch",
      label: "Parts Dispatch (Y/N)",
      width: "10%",
      backgroundColor: "#7C8F98",
      color: "#ffffff",
    },
    { key: "field_service", label: "Field Service (Y/N)", width: "10%", backgroundColor: "#7C8F98", color: "#ffffff" },
    {
      key: "digital_service",
      label: "Digital Services Offered (Y/N)",
      width: "10%",
      backgroundColor: "#90a4ae",
      color: "#ffffff",
    },
  ]

  // Safe KPI rendering with proper error handling
  const renderKPI = (title: string, value: any, unit = "", icon: React.ReactNode) => (
    <Paper elevation={3} sx={{ p: 2, textAlign: "center", height: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "start", gap: "28px" }}>
        {icon}
        <Typography sx={{ fontSize: "20px" }} variant="h6">
          {formatNumber(value, 0)}
          {unit}
        </Typography>
      </Box>
      <Typography sx={{ fontSize: "10px" }} variant="body2">
        {title}
      </Typography>
    </Paper>
  )

  const renderChart = (chartConfig: {
    title: string
    data: any[]
    chartType?: string
    colors?: string[]
  }) => {
    const { title, data, chartType = "Bar", colors: chartColors = colors } = chartConfig
  
    const handleChartClick = (entry: any) => {
      applyFilter(title, entry.name)
    }
  
    // Custom tooltip for percentage-based charts
    const CustomTooltip = ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div
            style={{
              backgroundColor: "#fff",
              padding: "8px",
              border: "1px solid #ccc",
              fontSize: "15px",
              lineHeight: 1.5,
              borderRadius: "4px",
              boxShadow: "0 0 5px rgba(0,0,0,0.1)",
            }}
          >
            <div>{label}</div>
            <div>{`percentage : ${payload[0].value}`}</div>
          </div>
        )
      }
      return null
    }    

    // Titles of charts that should use "percentage" in tooltips
    const percentageCharts = ["Call Hygiene", "Customer Service"] // <-- replace with your actual chart titles
    const isPercentageChart = percentageCharts.includes(title)
  
    const safeData = data.map((item) => ({
      ...item,
      value: safeNumber(item.value),
    }))
  
    return (
      <Paper sx={{ p: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontSize: "14px", textAlign: "center", mb: 1 }}>
          {title}
          {activeFilter?.category === title && (
            <Chip
              size="small"
              label={`Filtered: ${activeFilter.value}`}
              onDelete={() => applyFilter(title, activeFilter.value)}
              sx={{ ml: 1 }}
            />
          )}
        </Typography>
        <ResponsiveContainer width="100%" height={200}>
          {chartType === "Pie" ? (
            <PieChart>
              <Pie
                data={safeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={70}
                innerRadius={0}
                fill="#8884d8"
                dataKey="value"
                onClick={(entry) => handleChartClick(entry)}
                cursor="pointer"
                label={renderCustomizedLabel}
              >
                {safeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    opacity={activeFilter?.category === title && activeFilter?.value === entry.name ? 1 : 0.7}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          ) : chartType === "StackedBar" ? (
            <BarChart width={500} height={300} data={safeData} layout="vertical" barSize={40} barCategoryGap="15%">
              <XAxis
                type="number"
                tick={{ fontSize: 10 }}
                domain={[0, () => {
                  const maxCallTime = Math.max(...safeData.map((d) => safeNumber(d.CallTime)))
                  return Math.ceil(maxCallTime) // 10% padding
                }]}
              />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ fontSize: "12px", padding: "4px", lineHeight: "1" }}
                itemStyle={{ fontSize: "10px", margin: "0" }}
              />
              <Legend wrapperStyle={{ fontSize: "10px" }} />
              <Bar
                dataKey="HoldTime"
                stackId="a"
                fill={chartColors[0]}
                cursor="pointer"
                onClick={(entry) => handleChartClick(entry)}
              />
              <Bar
                dataKey="ResolutionTime"
                stackId="a"
                fill={chartColors[1]}
                cursor="pointer"
                onClick={(entry) => handleChartClick(entry)}
              />
              <Bar
                dataKey="RouteTime"
                stackId="a"
                fill={chartColors[2]}
                cursor="pointer"
                onClick={(entry) => handleChartClick(entry)}
              />
              <Bar
                dataKey="OtherTime"
                stackId="a"
                fill={chartColors[3] || "#D8BFD8"}
                cursor="pointer"
                onClick={(entry) => handleChartClick(entry)}
              />
            </BarChart>
          ) : (
            <BarChart data={safeData}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip content={isPercentageChart ? <CustomTooltip /> : undefined} />
              <Bar dataKey="value" barSize={40} onClick={(entry) => handleChartClick(entry)} cursor="pointer">
                {safeData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={chartColors[index % chartColors.length]}
                    opacity={activeFilter?.category === title && activeFilter?.value === entry.name ? 1 : 0.7}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </Paper>
    )
  }  

  // Show loading screen until all data is ready
  if (loading || tableLoading) {
    return (
      <Box
        sx={{
          bgcolor: "#f8f9fa",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={60} sx={{ color: "#6800E0", mb: 3 }} />
        <Typography variant="h6" sx={{ color: "#6800E0", mb: 1 }}>
          Loading Dashboard Data...
        </Typography>
        <Typography variant="body2" sx={{ color: "#666" }}>
          {loading && tableLoading
            ? "Loading dashboard and table data..."
            : loading
              ? "Loading dashboard data..."
              : "Loading table data..."}
        </Typography>
      </Box>
    )
  }

  // Show error state if data failed to load
  if (error && !dashboardData) {
    return (
      <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", p: 4 }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ mt: 4 }}>
            <AlertTitle>Error Loading Dashboard</AlertTitle>
            {error}
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  fetchDashboardData()
                  fetchTableData()
                }}
                sx={{ mr: 2 }}
              >
                Retry
              </Button>
            </Box>
          </Alert>
        </Container>
      </Box>
    )
  }

  // Prepare chart data from backend response with safe number conversion
  const callComplexityData = dashboardData
    ? [
        { name: "Easy", value: safeNumber(dashboardData.complexity?.easy) },
        { name: "Medium", value: safeNumber(dashboardData.complexity?.intermediate) },
        { name: "Difficult", value: safeNumber(dashboardData.complexity?.difficult) },
      ]
    : []

  const callHygieneData = dashboardData
    ? [
        { name: "Greeting", value: safeNumber(dashboardData.call_hygiene?.greeting) },
        { name: "Phone Number", value: safeNumber(dashboardData.call_hygiene?.phone_number) },
        { name: "Email", value: safeNumber(dashboardData.call_hygiene?.email) },
      ]
    : []

  const toneConversationData = dashboardData
    ? [
        { name: "Positive", value: safeNumber(dashboardData.tone_conversation?.positive) },
        { name: "Negative", value: safeNumber(dashboardData.tone_conversation?.negative) },
      ]
    : []

  const eventTypeData =
    dashboardData && dashboardData.event_type
      ? Object.entries(dashboardData.event_type).map(([name, value]) => ({
          name,
          value: safeNumber(value),
        }))
      : []

  const customerServiceData = dashboardData
    ? [
        { name: "Parts Request", value: safeNumber(dashboardData.customer_service?.parts_request) },
        { name: "Digital Service", value: safeNumber(dashboardData.customer_service?.digital_service) },
        { name: "Field Visits", value: safeNumber(dashboardData.customer_service?.field_visits) },
      ]
    : []

  const rootCauseAnalysis = dashboardData
    ? [
        {
          category: "Root Cause Analysis",
          HoldTime: safeNumber(dashboardData.root_cause_analysis?.hold_time),
          ResolutionTime: safeNumber(dashboardData.root_cause_analysis?.resolution_time),
          RouteTime: safeNumber(dashboardData.root_cause_analysis?.route_time),
          CallTime: safeNumber(dashboardData.root_cause_analysis?.call_time),
          OtherTime: safeNumber(dashboardData.root_cause_analysis?.other_time),
        },
      ]
    : []

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
          <InsertChartOutlined sx={{ fontSize: "18px" }} />
          Call Analysis Dashboard
        </Typography>

        {/* File Status Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: "#666", fontSize: "12px" }}>
            {files.filter((f) => f.status === "success").length > 0
              ? `Using ${files.filter((f) => f.status === "success").length} uploaded file(s)`
              : "Using demo files (no files uploaded)"}
          </Typography>
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
              <Typography sx={{ minWidth: 120, textAlign: "start", fontSize: "12px", color: "#b0b0b0" }}>
                Category
              </Typography>
              <Typography sx={{ minWidth: 120, textAlign: "start", fontSize: "12px", color: "#b0b0b0" }}>
                Complexity
              </Typography>
              <Typography sx={{ minWidth: 120, textAlign: "start", fontSize: "12px", color: "#b0b0b0" }}>
                Event Type
              </Typography>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
              <FormControl sx={{ minWidth: 120 }}>
                <Select
                  sx={{ height: "30px", fontSize: "12px" }}
                  value={modality}
                  onChange={(e) => applyFilter("Modality", e.target.value as string)}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    <em style={{ fontSize: "12px" }}>Select</em>
                  </MenuItem>
                  <MenuItem sx={{ fontSize: "12px" }} value="All">
                    All
                  </MenuItem>
                  <MenuItem sx={{ fontSize: "12px" }} value="Ultrasound">
                    Ultrasound
                  </MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <Select
                  sx={{ height: "30px", fontSize: "12px" }}
                  value={complexity}
                  onChange={(e) => applyFilter("Calls Complexity", e.target.value as string)}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    <em style={{ fontSize: "12px" }}>Select</em>
                  </MenuItem>
                  <MenuItem sx={{ fontSize: "12px" }} value="All">
                    All
                  </MenuItem>
                  <MenuItem sx={{ fontSize: "12px" }} value="Easy">
                    Easy
                  </MenuItem>
                  <MenuItem sx={{ fontSize: "12px" }} value="Intermediate">
                    Medium
                  </MenuItem>
                  <MenuItem sx={{ fontSize: "12px" }} value="Difficult">
                    Difficult
                  </MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ minWidth: 120 }}>
                <Select
                  sx={{ height: "30px", fontSize: "12px" }}
                  value={eventType}
                  onChange={(e) => applyFilter("Event Type", e.target.value as string)}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    <em style={{ fontSize: "12px" }}>Select</em>
                  </MenuItem>
                  <MenuItem sx={{ fontSize: "12px" }} value="All">
                    All
                  </MenuItem>
                  {dashboardData &&
                    dashboardData.event_type &&
                    Object.keys(dashboardData.event_type).map((type) => (
                      <MenuItem key={type} sx={{ fontSize: "12px" }} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Box>

        {/* KPI Cards */}
        <Grid
          container
          spacing={2}
          sx={{ justifyContent: "space-between", flexWrap: "nowrap", overflow: "hidden", padding: "5px" }}
        >
          <Grid item sx={{ flex: "1 1 auto", textAlign: "center", minWidth: "150px", maxWidth: "150px" }}>
            {renderKPI(
              "Total Calls",
              dashboardData?.summary?.total_calls,
              "",
              <TtyOutlinedIcon sx={{ fontSize: 20, color: "#8c51e1" }} />,
            )}
          </Grid>
          <Grid item sx={{ flex: "1 1 auto", textAlign: "center", minWidth: "150px", maxWidth: "150px" }}>
            {renderKPI(
              "Call Routing Accuracy",
              dashboardData?.summary?.call_routing_accuracy,
              "%",
              <AirlineStopsOutlinedIcon sx={{ fontSize: 20, color: "#8c51e1" }} />,
            )}
          </Grid>
          <Grid item sx={{ flex: "1 1 auto", textAlign: "center", minWidth: "150px", maxWidth: "150px" }}>
            {renderKPI(
              "Multiple Agents Invited",
              dashboardData?.summary?.multiple_agents,
              "%",
              <ConnectWithoutContactOutlinedIcon sx={{ fontSize: 20, color: "#8c51e1" }} />,
            )}
          </Grid>
          <Grid item sx={{ flex: "1 1 auto", textAlign: "center", minWidth: "150px", maxWidth: "150px" }}>
            {renderKPI(
              "Call Hold",
              dashboardData?.summary?.call_hold_percentage,
              "%",
              <PhonePausedOutlinedIcon sx={{ fontSize: 20, color: "#8c51e1" }} />,
            )}
          </Grid>
          <Grid item sx={{ flex: "1 1 auto", textAlign: "center", minWidth: "150px", maxWidth: "150px" }}>
            {renderKPI(
              "Hold Time",
              dashboardData?.summary?.call_hold_time,
              " s",
              <AccessTimeSharpIcon sx={{ fontSize: 20, color: "#8c51e1" }} />,
            )}
          </Grid>
          <Grid item sx={{ flex: "1 1 auto", textAlign: "center", minWidth: "150px", maxWidth: "150px" }}>
            {renderKPI(
              "Escalated Calls",
              dashboardData?.summary?.escalated_calls,
              "%",
              <MoveUpOutlinedIcon sx={{ fontSize: 20, color: "#8c51e1" }} />,
            )}
          </Grid>
          <Grid item sx={{ flex: "1 1 auto", textAlign: "center", minWidth: "150px", maxWidth: "150px" }}>
            {renderKPI(
              "Resolution Confirmation",
              dashboardData?.summary?.resolution_confirmation,
              "%",
              <HowToRegOutlinedIcon sx={{ fontSize: 20, color: "#8c51e1" }} />,
            )}
          </Grid>
          <Grid item sx={{ flex: "1 1 auto", textAlign: "center", minWidth: "150px", maxWidth: "150px" }}>
            {renderKPI(
              "Digital Services Offered",
              dashboardData?.summary?.cs_portal_recommended,
              "%",
              <TravelExploreOutlinedIcon sx={{ fontSize: 20, color: "#8c51e1" }} />,
            )}
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {[
            { title: "Calls Complexity", data: callComplexityData, color: "#1877F2" },
            { title: "Call Hygiene", data: callHygieneData, color: "#979FDE" },
            { title: "Tone of Customer", data: toneConversationData, chartType: "Pie", colors: COLORS },
            { title: "Event Type", data: eventTypeData, color: "#5F81CE" },
            { title: "Customer Service", data: customerServiceData, color: "#8884d8" },
            {
              title: "Root Cause Analysis",
              data: rootCauseAnalysis,
              chartType: "StackedBar",
              colors: ["#00308F", "#5F81CE", "#95D7FF"],
            },
          ].map((chart, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              {renderChart(chart)}
            </Grid>
          ))}
        </Grid>

        {/* Data Table */}
        <TableContainer
          component={Paper}
          sx={{ boxShadow: 3, borderRadius: 2, maxWidth: "1090px", margin: "auto", mt: 4, overflowX: "auto" }}
        >
          <Typography gutterBottom component="div" sx={{ p: "10px", fontSize: "14px" }}>
            Call Data Table
          </Typography>
          <Table sx={{ minWidth: 650 }} aria-label="call data table">
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <StyledTableCell key={column.key} config={column}>
                    {column.label}
                  </StyledTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center">
                    No data available
                  </TableCell>
                </TableRow>
              ) : (
                tableData.map((row: any, index: number) => (
                  <TableRow key={index} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" } }}>
                    {columns.map((column) => (
                      <DataTableCell key={`${index}-${column.key}`}>
                        {column.key === "transcript" ? (
                          <IconButton
                            onClick={() => handleOpenTranscript(row.transcript, row.filename)}
                            disabled={!row.transcript}
                          >
                            <TextSnippet color={row.transcript ? "primary" : "disabled"} />
                          </IconButton>
                        ) : column.key === "call_quality" ? (
                          (() => {
                            const qualityValue = safeNumber(row[column.key])
                            const wholeNumber = Math.round(qualityValue)
                            if (qualityValue === 100) return `${wholeNumber}% Good`
                            if (qualityValue >= 55.55) return `${wholeNumber}% Can be improved`
                            return `${wholeNumber}% Poor`
                          })()
                        ) : (
                          (row[column.key] !== undefined && row[column.key] !== null && row[column.key] !== "") ? String(row[column.key]) : "0"
                        )}
                      </DataTableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Transcript Dialog */}
        <Dialog open={openTranscriptDialog} onClose={() => setOpenTranscriptDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            Transcript
            <IconButton
              onClick={() => setOpenTranscriptDialog(false)}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {selectedTranscript ? (
              <Typography
                variant="body1"
                component="div"
                sx={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                  fontSize: "14px",
                  lineHeight: 1.6,
                  maxHeight: "60vh",
                  overflow: "auto",
                  padding: 1,
                }}
              >
                {selectedTranscript}
              </Typography>
            ) : (
              <Typography variant="body1" color="text.secondary" align="center">
                No transcript available for this call.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={downloadTranscript}
              disabled={!selectedTranscript}
              sx={{
                backgroundColor: "#6800E0",
                color: "white",
                height: "35px",
                fontSize: "12px",
                "&:hover": {
                  backgroundColor: "#5600B8",
                },
                "&:disabled": {
                  backgroundColor: "#A9A9A9",
                  color: "white",
                },
              }}
            >
              <GetApp sx={{ color: "white", height: "16px", mr: 1 }} />
              Download
            </Button>
            <Button onClick={() => setOpenTranscriptDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Alerts */}
        {alert.show && (
          <Alert sx={{ mt: 2 }} severity={alert.type as "error" | "info" | "success" | "warning"}>
            <AlertTitle>{alert.type === "error" ? "Error" : "Info"}</AlertTitle>
            {alert.message}
          </Alert>
        )}
        {error && (
          <Alert sx={{ mt: 2 }} severity="error">
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}
      </Container>
    </Box>
  )
}

export default Dashboard
