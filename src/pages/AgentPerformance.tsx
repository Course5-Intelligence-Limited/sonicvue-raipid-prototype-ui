"use client"

import type React from "react"
import { useState, useEffect, useContext } from "react"
import {
  Box,
  Container,
  Typography,
  MenuItem,
  Select,
  type SelectChangeEvent,
  FormControl,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Rating,
  styled,
  CircularProgress,
  Alert,
} from "@mui/material"
import {
  MoreVert as MoreVertIcon,
  Phone,
  Person,
  Speed,
  StarRate,
  AccessTime,
  Timer,
  HourglassEmpty,
} from "@mui/icons-material"
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined"
import { AuthContext } from "../context/AuthContext"
import { useUpload } from "../context/FileContext" // Import the file context

// Types for API response
interface AgentStatistics {
  agentName: string
  totalCalls: number
  emailResponsePercentage: number
  phoneResponsePercentage: number
  greetingPercentage: number
  digitalServicePercentage: number
  resolutionPercentage: number
  averageHandlingTime: number
  qualityScore: number
}

interface DashboardData {
  agentStatistics: AgentStatistics[]
  totalCallsOnWhole: number
  totalAgents: number
  averageCallsHandled: number
  csatScore: number
  averageHandlingTime: number
  averageCallDuration: number
  averageHoldTime: number
}

// Styled components with reduced sizes
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: "white",
  fontWeight: 500,
  padding: "8px 12px",
  fontSize: "13px",
  whiteSpace: "nowrap",
  "&:first-of-type": { width: "50px" },
  "&:nth-of-type(2)": { width: "130px" },
  "&:nth-of-type(3)": { width: "90px" },
  "&:nth-of-type(4)": { width: "100px" },
  "&:nth-of-type(5)": { width: "130px" },
  "&:last-child": { width: "50px" },
}))

const PercentageCell = styled(TableCell)<{ value: number }>(({ value }) => ({
  padding: "8px 12px",
  width: "90px",
  "& .percentage": {
    backgroundColor: value >= 70 ? "rgba(46, 204, 113, 0.1)" : "rgba(255, 99, 71, 0.1)",
    color: value >= 70 ? "rgb(46, 204, 113)" : "rgb(255, 99, 71)",
    padding: "3px 6px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: 500,
  },
}))

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
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mr: 0.5 }}>{icon}</Box>
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

// Format time in minutes to a more readable format
const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)} Min`
  } else {
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m`
  }
}

// Format seconds to HH:MM:SS format
const formatSeconds = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  return `${minutes}m ${secs}s`
}

export default function AgentDashboard(): React.ReactElement {
  const [callType, setCallType] = useState("")
  const [escalationStatus, setEscalationStatus] = useState("")
  const [qualityScore, setQualityScore] = useState("")
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tokenRefreshed, setTokenRefreshed] = useState(false)

  // Use the AuthContext to access authentication state and functions
  const { isAuthenticated, getAuthToken } = useContext(AuthContext)

  // Use the file context to get uploaded files
  const { files } = useUpload()

  // Default file list to use when no files are uploaded
  const defaultFileList = ["final_record_10.mp3", "final_record_11.mp3", "final_record_3 2.mp3"]

  const fetchData = async (retryAfterRefresh = false): Promise<void> => {
    setLoading(true)
    setError(null)

    try {
      const token = getAuthToken()
      console.log("Token being sent:", token)

      if (!token) {
        setError("Authentication token not found. Please refresh the page or log in again.")
        setLoading(false)
        return
      }

      // Get successfully uploaded files or use default list
      const uploadedFiles = files.filter((file) => file.status === "success").map((file) => file.file.name)
      const fileList = uploadedFiles.length > 0 ? uploadedFiles : defaultFileList

      // Build request body with filters and file list
      const requestBody: Record<string, any> = {
        file_list: fileList, // Always include file_list
      }

      // Add filters if selected
      if (callType) requestBody.callType = callType
      if (escalationStatus) requestBody.escalation = escalationStatus === "escalated" ? "Yes" : "No"

      console.log("Request body:", requestBody) // Debug log

      const response = await fetch("http://172.203.229.218:8080/agent-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          clientId: "synct",
          clientSecret: "B5Ciz82LRM",
        },
        body: JSON.stringify(requestBody),
      })

      if (response.status === 401 && !retryAfterRefresh) {
        console.log("Token expired. Attempting to refresh token...")
        setTokenRefreshed(true)
        fetchData(true)
        return
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("API Response:", data) // Debug log
      setDashboardData(data)
      setTokenRefreshed(false)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on initial load and when filters or files change
  useEffect(() => {
    if (isAuthenticated) {
      const token = getAuthToken()
      if (!token) {
        setError("Session expired. Please refresh the page or log in again.")
        return
      }

      fetchData()
    }
  }, [callType, escalationStatus, qualityScore, isAuthenticated, files]) // Added files dependency

  const handleSelectChange =
    (setState: React.Dispatch<React.SetStateAction<string>>) => (event: SelectChangeEvent<unknown>) => {
      setState(event.target.value as string)
    }

  // Filter agents based on quality score if selected
  const filteredAgents =
    dashboardData?.agentStatistics.filter((agent) => {
      if (!qualityScore) return true
      const score = Number.parseInt(qualityScore.split("/")[0])
      return agent.qualityScore === score
    }) || []

  // Generate KPI cards data from API response
  const getKpiData = () => {
    if (!dashboardData) return []

    return [
      {
        icon: <Phone sx={{ color: "#6C2BD9", fontSize: "18px" }} />,
        value: dashboardData.totalCallsOnWhole.toString(),
        label: "Total calls",
      },
      {
        icon: <Person sx={{ color: "#6C2BD9", fontSize: "18px" }} />,
        value: dashboardData.totalAgents.toString(),
        label: "Total agents",
      },
      {
        icon: <Speed sx={{ color: "#6C2BD9", fontSize: "18px" }} />,
        value: Math.round(dashboardData.averageCallsHandled).toString(),
        label: "Average calls handled",
      },
      {
        icon: <StarRate sx={{ color: "#6C2BD9", fontSize: "18px" }} />,
        value: `${Math.round(dashboardData.csatScore)}%`,
        label: "CSAT scores",
      },
      {
        icon: <AccessTime sx={{ color: "#6C2BD9", fontSize: "18px" }} />,
        value: formatSeconds(dashboardData.averageHandlingTime),
        label: "Average Handling Time",
      },
      {
        icon: <Timer sx={{ color: "#6C2BD9", fontSize: "18px" }} />,
        value: formatSeconds(dashboardData.averageCallDuration),
        label: "Average call duration",
      },
      {
        icon: <HourglassEmpty sx={{ color: "#6C2BD9", fontSize: "18px" }} />,
        value: formatSeconds(dashboardData.averageHoldTime),
        label: "Average hold time",
      },
    ]
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
          <SupportAgentOutlinedIcon sx={{ fontSize: "18px" }} />
          Agent Performance
        </Typography>

        {/* Filters */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: 1.5,
            mb: 2,
            alignItems: { xs: "stretch", lg: "center" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5,
              flex: 1,
              flexWrap: { sm: "wrap", lg: "nowrap" },
            }}
          >
            <FormControl sx={{ minWidth: { xs: "100%", sm: 180 }, flex: { sm: "1 1 calc(33.33% - 6px)", lg: 1 } }}>
              <StyledSelect value={callType} onChange={handleSelectChange(setCallType)} displayEmpty>
                <MenuItem value="">
                  <em>Clear Filter</em>
                </MenuItem>
                <MenuItem value="" disabled>
                  Call Type
                </MenuItem>
                <MenuItem value="Incident">Incident</MenuItem>
                <MenuItem value="Reactive">Reactive</MenuItem>
                <MenuItem value="Proactive">Proactive</MenuItem>
                <MenuItem value="Installation">Installation</MenuItem>
                <MenuItem value="Scheduled">Scheduled</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </StyledSelect>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: "100%", sm: 180 }, flex: { sm: "1 1 calc(33.33% - 6px)", lg: 1 } }}>
              <StyledSelect value={escalationStatus} onChange={handleSelectChange(setEscalationStatus)} displayEmpty>
                <MenuItem value="">
                  <em>Clear Filter</em>
                </MenuItem>
                <MenuItem value="" disabled>
                  Escalation Status
                </MenuItem>
                <MenuItem value="escalated">Escalated</MenuItem>
                <MenuItem value="not-escalated">Not Escalated</MenuItem>
              </StyledSelect>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: "100%", sm: 180 }, flex: { sm: "1 1 calc(33.33% - 6px)", lg: 1 } }}>
              <StyledSelect value={qualityScore} onChange={handleSelectChange(setQualityScore)} displayEmpty>
                <MenuItem value="">
                  <em>Clear Filter</em>
                </MenuItem>
                <MenuItem value="" disabled>
                  Quality Score
                </MenuItem>
                <MenuItem value="5/5">5/5</MenuItem>
                <MenuItem value="4/5">4/5</MenuItem>
                <MenuItem value="3/5">3/5</MenuItem>
                <MenuItem value="2/5">2/5</MenuItem>
                <MenuItem value="1/5">1/5</MenuItem>
              </StyledSelect>
            </FormControl>
          </Box>
        </Box>

        {tokenRefreshed && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Your session was refreshed. If you continue to experience issues, please log out and log back in.
          </Alert>
        )}

        {!isAuthenticated ? (
          <Box sx={{ textAlign: "center", my: 4, color: "error.main" }}>
            <Typography>You need to be logged in to view this dashboard.</Typography>
          </Box>
        ) : loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <CircularProgress sx={{ color: "#6C2BD9" }} />
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", my: 4, color: "error.main" }}>
            <Typography>{error}</Typography>
            <Button variant="outlined" onClick={() => fetchData()} sx={{ mt: 2 }}>
              Retry
            </Button>
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

            {/* Table */}
            <Typography variant="h6" sx={{ mb: 1.5, fontSize: "15px", fontWeight: 500 }}>
              Quality audit scores
            </Typography>

            <TableContainer
              component={Paper}
              sx={{
                border: "1px solid #E5E7EB",
                borderRadius: "6px",
                mb: 2.5,
                maxWidth: "100%",
                overflowX: "auto",
                "&::-webkit-scrollbar": {
                  height: "6px",
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: "#E5E7EB",
                  borderRadius: "3px",
                },
              }}
            >
              <Table sx={{ tableLayout: "fixed", width: "100%" }}>
                <TableHead>
                  <TableRow>
                    {[
                      "S.No",
                      "Agent Name",
                      "Total Calls",
                      "Quality Score",
                      "Avg handling time",
                      "Email",
                      "Phone Number",
                      "Greeted",
                      "Digital portal",
                      "Resolution",
                      "Overall Rating",
                      "",
                    ].map((header, index) => (
                      <StyledTableCell
                        key={index}
                        sx={{
                          backgroundColor: "#000000",
                          color: "white",
                          fontWeight: 600,
                          fontSize: "13px",
                        }}
                      >
                        {header}
                      </StyledTableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAgents.map((agent, index) => (
                    <TableRow key={index} sx={{ "&:hover": { bgcolor: "#F9FAFB" } }}>
                      <TableCell sx={{ padding: "8px 12px", fontSize: "13px" }}>{index + 1}</TableCell>
                      <TableCell sx={{ padding: "8px 12px", fontWeight: 500, fontSize: "13px" }}>
                        {agent.agentName}
                      </TableCell>
                      <TableCell sx={{ padding: "8px 12px", fontSize: "13px" }}>{agent.totalCalls}</TableCell>
                      <TableCell sx={{ padding: "8px 12px", fontSize: "13px" }}>{agent.qualityScore}/5</TableCell>
                      <TableCell sx={{ padding: "8px 12px", fontSize: "13px" }}>
                        {formatSeconds(agent.averageHandlingTime)}
                      </TableCell>
                      <PercentageCell value={agent.emailResponsePercentage}>
                        <span className="percentage">{Math.round(agent.emailResponsePercentage)}%</span>
                      </PercentageCell>
                      <PercentageCell value={agent.phoneResponsePercentage}>
                        <span className="percentage">{Math.round(agent.phoneResponsePercentage)}%</span>
                      </PercentageCell>
                      <PercentageCell value={agent.greetingPercentage}>
                        <span className="percentage">{Math.round(agent.greetingPercentage)}%</span>
                      </PercentageCell>
                      <PercentageCell value={agent.digitalServicePercentage}>
                        <span className="percentage">{Math.round(agent.digitalServicePercentage)}%</span>
                      </PercentageCell>
                      <PercentageCell value={agent.resolutionPercentage}>
                        <span className="percentage">{Math.round(agent.resolutionPercentage)}%</span>
                      </PercentageCell>
                      <TableCell sx={{ padding: "8px 12px" }}>
                        <Rating
                          value={agent.qualityScore}
                          readOnly
                          max={5}
                          size="small"
                          sx={{
                            "& .MuiRating-iconFilled": {
                              color: "#7C3AED",
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ padding: "8px 12px" }}>
                        <IconButton size="small">
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : null}
      </Container>
    </Box>
  )
}
