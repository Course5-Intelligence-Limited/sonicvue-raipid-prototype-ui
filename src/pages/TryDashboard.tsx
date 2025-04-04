"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Box,
  Typography,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
  Button,
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
} from "@mui/material"
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { InsertChartOutlined, Close, TextSnippet, GetApp } from "@mui/icons-material"
import axios from "axios"
import TtyOutlinedIcon from "@mui/icons-material/TtyOutlined"
import AirlineStopsOutlinedIcon from "@mui/icons-material/AirlineStopsOutlined"
import ConnectWithoutContactOutlinedIcon from "@mui/icons-material/ConnectWithoutContactOutlined"
import PhonePausedOutlinedIcon from "@mui/icons-material/PhonePausedOutlined"
import MoveUpOutlinedIcon from "@mui/icons-material/MoveUpOutlined"
import HowToRegOutlinedIcon from "@mui/icons-material/HowToRegOutlined"
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined"

const COLORS = ["#5ED061", "#EA4D4D", "#00308F", "#FF8042"]
const colors = ["#1877F2", "#3457D5", "#00308F"]

interface DashboardData {
  summary: {
    total_calls: number
    call_routing_accuracy: number
    multiple_agents: number
    call_hold_percentage: number
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
  }
  customer_service: {
    parts_request: number
    digital_service: number
    field_visits: number
  }
  [key: string]: any
}

interface TableData {
  [key: string]: string | number | boolean | undefined
  key: string
  label: string
  width: string
  backgroundColor: string
  color: string
  transcript?: string
  transcriptStatus?: string
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
  modality?: string
  event_type?: string
}

const StyledTableCell = styled(TableCell)<{ config: TableData }>(({ theme, config }) => ({
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

// Custom label renderer for pie chart to make font smaller and position labels outside the chart
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, fill }: any) => {
  const RADIAN = Math.PI / 180
  // Increase the radius to position labels further from the pie
  const radius = outerRadius * 1.2 // Increased from 0.8 to 1.2 to move labels outward
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  // Add a small line connecting the pie to the label
  const lineX1 = cx + outerRadius * 0.95 * Math.cos(-midAngle * RADIAN)
  const lineY1 = cy + outerRadius * 0.95 * Math.sin(-midAngle * RADIAN)
  const lineX2 = cx + outerRadius * 1.1 * Math.cos(-midAngle * RADIAN)
  const lineY2 = cy + outerRadius * 1.1 * Math.sin(-midAngle * RADIAN)

  return (
    <g>
      {/* Line connecting pie to label */}
      <line x1={lineX1} y1={lineY1} x2={lineX2} y2={lineY2} stroke={fill} strokeWidth={1} />

      {/* The label text */}
      <text x={x} y={y} fill={fill} textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize="12px">
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  )
}

const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [tableData, setTableData] = useState<TableData[]>([])
  const [filteredData, setFilteredData] = useState<DashboardData | null>(null)
  const [filteredTableData, setFilteredTableData] = useState<TableData[]>([])
  const [activeFilter, setActiveFilter] = useState<{ category: string; value: string } | null>(null)
  const [modality, setModality] = useState("All")
  const [complexity, setComplexity] = useState("All")
  const [eventType, setEventType] = useState("All")
  const [toneFilter, setToneFilter] = useState<string | null>("All")
  const [loading, setLoading] = useState(true)
  const [openTranscriptDialog, setOpenTranscriptDialog] = useState(false)
  const [selectedTranscript, setSelectedTranscript] = useState("")
  const [selectedFilename, setSelectedFilename] = useState("")
  const [alert, setAlert] = useState({ show: false, message: "", type: "info" })
  const [tableLoading, setTableLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    fetchTableData()
  }, [])

  useEffect(() => {
    fetchDashboardData()
    fetchTableData()
  }, [modality, complexity, eventType, toneFilter])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://172.203.229.218:8080/dashboard-data", {
        params: {
          modality: modality === "All" ? undefined : modality,
          complexity: complexity === "All" ? undefined : complexity === "Medium" ? "Intermediate" : complexity,
          eventType: eventType === "All" ? undefined : eventType,
          tone: toneFilter === "All" ? undefined : toneFilter,
        },
      })
      setDashboardData(response.data)
      setFilteredData(response.data)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      setDashboardData(null)
      setFilteredData(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchTableData = async () => {
    setTableLoading(true)
    try {
      const response = await axios.get("http://172.203.229.218:8080/table-data", {
        params: {
          modality: modality === "All" ? undefined : modality,
          complexity: complexity === "All" ? undefined : complexity === "Medium" ? "Intermediate" : complexity,
          eventType: eventType === "All" ? undefined : eventType,
          tone: toneFilter,
        },
      })
      const allData = response.data || []
      setTableData(allData)
      applyFilters(allData)
    } catch (error) {
      console.error("Error fetching table data:", error)
      setTableData([])
      setFilteredTableData([])
    } finally {
      setTableLoading(false)
    }
  }

  const applyFilters = (data: TableData[]) => {
    let filteredData = [...data]

    if (modality !== "All") {
      filteredData = filteredData.filter((row) => row.modality === modality)
    }

    if (complexity !== "All") {
      filteredData = filteredData.filter((row) => {
        if (complexity === "Medium") {
          return row.complexity === "Intermediate"
        }
        return row.complexity === complexity
      })
    }

    if (eventType !== "All") {
      filteredData = filteredData.filter((row) => row.call_type === eventType)
    }

    if (toneFilter !== "All") {
      filteredData = filteredData.filter((row) => row.call_tone === toneFilter)
    }

    setFilteredTableData(filteredData)
  }

  const applyFilter = (category: string, value: string) => {
    if (activeFilter?.category === category && activeFilter?.value === value) {
      setActiveFilter(null)
      setModality("All")
      setComplexity("All")
      setEventType("All")
      setToneFilter("All")
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
        case "Tone of Customer":
          setToneFilter(value)
          break
      }
    }
  }

  const handleOpenTranscript = (transcript: string | undefined, status: string | undefined, filename: string) => {
    console.log("Opening transcript:", transcript ? transcript.substring(0, 100) + "..." : "No transcript")
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

  const columns: TableData[] = [
    { key: "filename", label: "File Name", width: "8%", backgroundColor: "#90a4ae", color: "#ffffff" },
    { key: "call_time", label: "Call Time (Sec)", width: "8%", backgroundColor: "#7C8F98", color: "#ffffff" },
    { key: "hold_time", label: "Hold Time (Sec)", width: "8%", backgroundColor: "#90a4ae", color: "#ffffff" },
    { key: "route_time", label: "Route Time (Sec)", width: "8%", backgroundColor: "#7C8F98", color: "#ffffff" },
    { key: "resolution_time", label: "Resolution Time (Sec)", width: "10%", backgroundColor: "#90a4ae", color: "#ffffff" },
    { key: "greeting", label: "Greeting (Y/N)", width: "10%", backgroundColor: "#7C8F98", color: "#ffffff" },
    { key: "phone_number", label: "Phone Number Collected (Y/N)", width: "10%", backgroundColor: "#90a4ae", color: "#ffffff" },
    { key: "email_address", label: "Email Address Collected (Y/N)", width: "15%", backgroundColor: "#7C8F98", color: "#ffffff" },
    { key: "call_quality", label: "Call Quality", width: "8%", backgroundColor: "#90a4ae", color: "#ffffff" },
    { key: "resolution_confirmation", label: "Resolution Confirmation (Y/N)", width: "10%", backgroundColor: "#90a4ae", color: "#ffffff" },
    { key: "hold", label: "Hold", width: "5%", backgroundColor: "#7C8F98", color: "#ffffff" },
    { key: "hold_satisfaction", label: "Hold Satisfaction", width: "10%", backgroundColor: "#90a4ae", color: "#ffffff" },
    { key: "multiple_agents", label: "Multiple Agents (Y/N)", width: "10%", backgroundColor: "#7C8F98", color: "#ffffff" },
    { key: "escalation", label: "Escalation (Y/N)", width: "10%", backgroundColor: "#90a4ae", color: "#ffffff" },
    { key: "call_tone", label: "Call Tone", width: "10%", backgroundColor: "#7C8F98", color: "#ffffff" },
    { key: "issue_discussed", label: "Issue Discussed", width: "10%", backgroundColor: "#90a4ae", color: "#ffffff" },
    { key: "complexity", label: "Complexity", width: "10%", backgroundColor: "#7C8F98", color: "#ffffff" },
    { key: "issue_type", label: "Issue Type", width: "10%", backgroundColor: "#90a4ae", color: "#ffffff" },
    { key: "status_query", label: "Status Query", width: "10%", backgroundColor: "#7C8F98", color: "#ffffff" },
    { key: "call_type", label: "Call Type", width: "10%", backgroundColor: "#90a4ae", color: "#ffffff" },
    { key: "part_request", label: "Part Request (Y/N)", width: "10%", backgroundColor: "#90a4ae", color: "#ffffff" },
    { key: "parts_dispatch", label: "Parts Dispatch (Y/N)", width: "10%", backgroundColor: "#7C8F98", color: "#ffffff" },
    { key: "field_service", label: "Field Service (Y/N)", width: "10%", backgroundColor: "#7C8F98", color: "#ffffff" },
    { key: "digital_service", label: "Digital Services Offered (Y/N)", width: "10%", backgroundColor: "#90a4ae", color: "#ffffff" },
    // { key: "transcript", label: "Transcript", width: "5%", backgroundColor: "#7C8F98", color: "#ffffff" },
  ]

  const renderKPI = (title: string, value: number, unit = "", icon: React.ReactNode) => (
    <Paper elevation={3} sx={{ p: 2, textAlign: "center", height: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "start", gap: "28px" }}>
        {icon}
        <Typography sx={{ fontSize: "20px" }} variant="h6">
          {value?.toFixed(0) || 0}
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
      if (title === "Tone of Customer") {
        applyFilter(title, entry.name)
      } else if (title === "Event Type") {
        applyFilter(title, entry.name)
      } else {
        applyFilter(title, entry.name)
      }
    }

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
                data={data}
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
                {data.map((entry, index) => (
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
            <BarChart width={500} height={300} data={data} layout="vertical" barSize={40} barCategoryGap="15%">
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ fontSize: "8px", padding: "4px", lineHeight: "1" }}
                itemStyle={{ fontSize: "8px", margin: "0" }}
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
            </BarChart>
          ) : (
            <BarChart data={data}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" barSize={40} onClick={(entry) => handleChartClick(entry)} cursor="pointer">
                {data.map((entry, index) => (
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

  const calculateFilteredData = (data: TableData[]) => {
    const totalCalls = data.length
    const callRoutingAccuracy = (data.filter((row) => row.call_quality === "Good").length / data.length) * 100 || 0
    const multipleAgents = (data.filter((row) => row.multiple_agents === "Yes").length / data.length) * 100 || 0
    const callHoldPercentage =
      (data.reduce((sum, row) => sum + (Number.parseInt(row.hold_time?.toString() || "0") || 0), 0) /
        (data.length * 60)) *
      100 || 0
    const escalatedCalls = (data.filter((row) => row.escalation === "Yes").length / data.length) * 100 || 0
    const resolutionConfirmation =
      (data.filter((row) => row.resolution_confirmation === "Yes").length / data.length) * 100 || 0
    const csPortalRecommended =
      (data.filter((row) => row.cs_portal_recommended === "Yes").length / data.length) * 100 || 0

    const easyCalls = data.filter((row) => row.complexity === "Easy").length
    const intermediateCalls = data.filter((row) => row.complexity === "Intermediate").length
    const difficultCalls = data.filter((row) => row.complexity === "Difficult").length

    const greetingCalls = data.filter((row) => row.greeting !== "").length
    const phoneNumberCalls = data.filter((row) => row.phone_number !== "").length
    const emailCalls = data.filter((row) => row.email_address !== "").length

    const positiveCalls = data.filter((row) => row.call_tone === "Positive").length
    const negativeCalls = data.filter((row) => row.call_tone === "Negative").length

    const eventTypeCounts: { [key: string]: number } = {}
    data.forEach((row) => {
      const eventType = (row.call_type as string) || "Unknown"
      eventTypeCounts[eventType] = (eventTypeCounts[eventType] || 0) + 1
    })

    const totalHoldTime = data.reduce((sum, row) => sum + (Number.parseInt(row.hold_time?.toString() || "0") || 0), 0)
    const totalResolutionTime = data.reduce(
      (sum, row) => sum + (Number.parseInt(row.resolution_time?.toString() || "0") || 0),
      0,
    )
    const totalRouteTime = data.reduce((sum, row) => sum + (Number.parseInt(row.route_time?.toString() || "0") || 0), 0)

    const partsRequestCalls = data.filter((row) => row.part_request === "Yes").length
    const digitalServiceCalls = data.filter((row) => row.digital_service === "Yes").length
    const fieldVisitsCalls = data.filter((row) => row.field_service === "Yes").length

    return {
      summary: {
        total_calls: totalCalls,
        call_routing_accuracy: callRoutingAccuracy,
        multiple_agents: multipleAgents,
        call_hold_percentage: callHoldPercentage,
        escalated_calls: escalatedCalls,
        resolution_confirmation: resolutionConfirmation,
        cs_portal_recommended: csPortalRecommended,
      },
      complexity: {
        easy: easyCalls,
        intermediate: intermediateCalls,
        difficult: difficultCalls,
      },
      call_hygiene: {
        greeting: greetingCalls,
        phone_number: phoneNumberCalls,
        email: emailCalls,
      },
      tone_conversation: {
        positive: positiveCalls,
        negative: negativeCalls,
      },
      event_type: eventTypeCounts,
      root_cause_analysis: {
        hold_time: totalHoldTime,
        resolution_time: totalResolutionTime,
        route_time: totalRouteTime,
      },
      customer_service: {
        parts_request: partsRequestCalls,
        digital_service: digitalServiceCalls,
        field_visits: fieldVisitsCalls,
      },
    }
  }

  const filteredDashboardData = calculateFilteredData(filteredTableData)

  const callComplexityData = [
    { name: "Easy", value: filteredDashboardData?.complexity?.easy || 0 },
    { name: "Medium", value: filteredDashboardData?.complexity?.intermediate || 0 },
    { name: "Difficult", value: filteredDashboardData?.complexity?.difficult || 0 },
  ]

  const callHygieneData = [
    { name: "Greeting", value: filteredDashboardData?.call_hygiene?.greeting || 0 },
    { name: "Phone Number", value: filteredDashboardData?.call_hygiene?.phone_number || 0 },
    { name: "Email", value: filteredDashboardData?.call_hygiene?.email || 0 },
  ]

  const toneConversationData = [
    { name: "Positive", value: filteredDashboardData?.tone_conversation?.positive || 0 },
    { name: "Negative", value: filteredDashboardData?.tone_conversation?.negative || 0 },
  ]

  const eventTypeData = Object.entries(filteredDashboardData?.event_type || {}).map(([name, value]) => ({
    name,
    value,
  }))

  const customerServiceData = [
    { name: "Parts Request", value: filteredDashboardData?.customer_service?.parts_request || 0 },
    { name: "Digital Service", value: filteredDashboardData?.customer_service?.digital_service || 0 },
    { name: "Field Visits", value: filteredDashboardData?.customer_service?.field_visits || 0 },
  ]

  const rootCauseAnalysis = filteredDashboardData?.root_cause_analysis
    ? [
      {
        category: "Root Cause Analysis",
        HoldTime: filteredDashboardData.root_cause_analysis.hold_time,
        ResolutionTime: filteredDashboardData.root_cause_analysis.resolution_time,
        RouteTime: filteredDashboardData.root_cause_analysis.route_time,
      },
    ]
    : []

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
        <Typography sx={{ marginBottom: "20px", marginRight: "5px" }}>Welcome</Typography>
        <Typography sx={{ marginBottom: "20px", color: "#6800E0" }}>Astha!</Typography>
      </Typography>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          bgcolor: "#420897",
          height: "40px",
          color: "white",
          fontSize: "16px",
          p: 2,
          marginBottom: "10px",
          marginTop: "-15px",
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <InsertChartOutlined />
        Call Analysis Dashboard
      </Typography>

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
                <MenuItem sx={{ fontSize: "12px" }} value="CT">
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
                  Intermediate
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
                {Object.keys(filteredDashboardData?.event_type || {}).map((type) => (
                  <MenuItem key={type} sx={{ fontSize: "12px" }} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      <Grid
        container
        spacing={2}
        sx={{ justifyContent: "space-between", flexWrap: "nowrap", overflow: "hidden", padding: "5px" }}
      >
        <Grid item sx={{ flex: "1 1 auto", textAlign: "center", minWidth: "150px", maxWidth: "150px" }}>
          {renderKPI(
            "Total Calls",
            filteredDashboardData?.summary?.total_calls || 0,
            "",
            <TtyOutlinedIcon sx={{ fontSize: 20, color: "#8c51e1" }} />,
          )}
        </Grid>
        <Grid item sx={{ flex: "1 1 auto", textAlign: "center", minWidth: "150px", maxWidth: "150px" }}>
          {renderKPI(
            "Call Routing Accuracy",
            filteredDashboardData?.summary?.call_routing_accuracy || 0,
            "%",
            <AirlineStopsOutlinedIcon sx={{ fontSize: 20, color: "#8c51e1" }} />,
          )}
        </Grid>
        <Grid item sx={{ flex: "1 1 auto", textAlign: "center", minWidth: "150px", maxWidth: "150px" }}>
          {renderKPI(
            "Multiple Agents Invited",
            filteredDashboardData?.summary?.multiple_agents || 0,
            "%",
            <ConnectWithoutContactOutlinedIcon sx={{ fontSize: 20, color: "#8c51e1" }} />,
          )}
        </Grid>
        <Grid item sx={{ flex: "11 auto", textAlign: "center", minWidth: "150px", maxWidth: "150px" }}>
          {renderKPI(
            "Call Hold",
            filteredDashboardData?.summary?.call_hold_percentage || 0,
            "%",
            <PhonePausedOutlinedIcon sx={{ fontSize: 20, color: "#8c51e1" }} />,
          )}
        </Grid>
        <Grid item sx={{ flex: "1 1 auto", textAlign: "center", minWidth: "150px", maxWidth: "150px" }}>
          {renderKPI(
            "Escalated Calls",
            filteredDashboardData?.summary?.escalated_calls || 0,
            "%",
            <MoveUpOutlinedIcon sx={{ fontSize: 20, color: "#8c51e1" }} />,
          )}
        </Grid>
        <Grid item sx={{ flex: "1 1 auto", textAlign: "center", minWidth: "150px", maxWidth: "150px" }}>
          {renderKPI(
            "Resolution Confirmation",
            filteredDashboardData?.summary?.resolution_confirmation || 0,
            "%",
            <HowToRegOutlinedIcon sx={{ fontSize: 20, color: "#8c51e1" }} />,
          )}
        </Grid>
        <Grid item sx={{ flex: "1 1 auto", textAlign: "center", minWidth: "150px", maxWidth: "150px" }}>
          {renderKPI(
            "Digital Services Offered",
            filteredDashboardData?.summary?.cs_portal_recommended || 0,
            "%",
            <TravelExploreOutlinedIcon sx={{ fontSize: 20, color: "#8c51e1" }} />,
          )}
        </Grid>
      </Grid>

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
            {tableLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredTableData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              filteredTableData.map((row: any, index: number) => (
                <TableRow key={index} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" } }}>
                  {columns.map((column) => (
                    <DataTableCell key={`${index}-${column.key}`}>
                      {column.key === "transcript" ? (
                        <IconButton
                          onClick={() => handleOpenTranscript(row.transcript, row.transcriptStatus, row.filename)}
                          disabled={!row.transcript}
                        >
                          <TextSnippet color={row.transcript ? "primary" : "disabled"} />
                        </IconButton>
                      ) : column.key === "hold_time" || column.key === "route_time" ? (
                        String(row[column.key] || "0")
                      ) : (
                        String(row[column.key] || "")
                      )}
                    </DataTableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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

      {alert.show && (
        <Alert sx={{ mt: 2 }} severity={alert.type as "error" | "info" | "success" | "warning"}>
          <AlertTitle>{alert.type === "error" ? "Error" : "Info"}</AlertTitle>
          {alert.message}
        </Alert>
      )}
    </Box>
  )
}

export default Dashboard

