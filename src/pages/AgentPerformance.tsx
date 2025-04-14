"use client"

import type React from "react"
import { useState } from "react"
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
} from "@mui/material"
import {
  Download,
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

// Styled components with reduced sizes
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: "white",
  fontWeight: 500,
  padding: "8px 12px", // Reduced padding
  fontSize: "13px", // Reduced font size
  whiteSpace: "nowrap",
  "&:first-of-type": { width: "50px" }, // Reduced width
  "&:nth-of-type(2)": { width: "130px" }, // Reduced width
  "&:nth-of-type(3)": { width: "90px" }, // Reduced width
  "&:nth-of-type(4)": { width: "100px" }, // Reduced width
  "&:nth-of-type(5)": { width: "130px" }, // Reduced width
  "&:last-child": { width: "50px" }, // Reduced width
}))

const PercentageCell = styled(TableCell)<{ value: number }>(({ value }) => ({
  padding: "8px 12px", // Reduced padding
  width: "90px", // Reduced width
  "& .percentage": {
    backgroundColor: value >= 100 ? "rgba(46, 204, 113, 0.1)" : "rgba(255, 99, 71, 0.1)",
    color: value >= 100 ? "rgb(46, 204, 113)" : "rgb(255, 99, 71)",
    padding: "3px 6px", // Reduced padding
    borderRadius: "4px",
    fontSize: "11px", // Reduced font size
    fontWeight: 500,
  },
}))

const StyledSelect = styled(Select)({
  height: "36px", // Reduced height
  backgroundColor: "white",
  borderRadius: "6px", // Reduced border radius
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
      p: 1.5, // Reduced padding
      border: "1px solid #E5E7EB",
      borderRadius: "6px", // Reduced border radius
      display: "flex",
      alignItems: "flex-start",
      gap: 1.5, // Reduced gap
      height: "100%",
      minHeight: "80px", // Reduced min height
    }}
  >
    <Box
      sx={{
        width: "32px", // Reduced size
        height: "32px", // Reduced size
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

const mockData = [
  {
    id: 1,
    name: "Kevin Andrews",
    totalCalls: 10,
    qualityScore: "4/5",
    avgHandlingTime: "00:15:32:12",
    email: 100,
    phoneNumber: 77,
    greeted: 100,
    digitalSolution: 100,
    resolution: 100,
    rating: 4.5,
  },
  {
    id: 2,
    name: "John Tan",
    totalCalls: 8,
    qualityScore: "5/5",
    avgHandlingTime: "00:15:32:12",
    email: 100,
    phoneNumber: 100,
    greeted: 100,
    digitalSolution: 100,
    resolution: 100,
    rating: 4.5,
  },
  {
    id: 3,
    name: "Rolex",
    totalCalls: 6,
    qualityScore: "3/5",
    avgHandlingTime: "00:15:32:12",
    email: 100,
    phoneNumber: 77,
    greeted: 100,
    digitalSolution: 77,
    resolution: 100,
    rating: 4.5,
  },
  {
    id: 4,
    name: "Kevin",
    totalCalls: 2,
    qualityScore: "4/5",
    avgHandlingTime: "00:15:32:12",
    email: 100,
    phoneNumber: 77,
    greeted: 100,
    digitalSolution: 100,
    resolution: 100,
    rating: 4.5,
  },
  {
    id: 5,
    name: "Williams",
    totalCalls: 7,
    qualityScore: "5/5",
    avgHandlingTime: "00:15:32:12",
    email: 100,
    phoneNumber: 100,
    greeted: 100,
    digitalSolution: 100,
    resolution: 100,
    rating: 4.5,
  },
  {
    id: 6,
    name: "Kevin Andrews",
    totalCalls: 6,
    qualityScore: "4/5",
    avgHandlingTime: "00:15:32:12",
    email: 100,
    phoneNumber: 77,
    greeted: 100,
    digitalSolution: 100,
    resolution: 100,
    rating: 4.5,
  },
  {
    id: 7,
    name: "Marshal Xavier",
    totalCalls: 9,
    qualityScore: "5/5",
    avgHandlingTime: "00:15:32:12",
    email: 100,
    phoneNumber: 100,
    greeted: 100,
    digitalSolution: 100,
    resolution: 100,
    rating: 4.5,
  },
]

export default function AgentDashboard(): React.ReactElement {
  const [callType, setCallType] = useState("")
  const [escalationStatus, setEscalationStatus] = useState("")
  const [qualityScore, setQualityScore] = useState("")

  const handleSelectChange =
    (setState: React.Dispatch<React.SetStateAction<string>>) => (event: SelectChangeEvent<unknown>) => {
      setState(event.target.value as string)
    }

  const kpiData = [
    { icon: <Phone sx={{ color: "#6C2BD9", fontSize: "18px" }} />, value: "200", label: "Total calls" },
    { icon: <Person sx={{ color: "#6C2BD9", fontSize: "18px" }} />, value: "20", label: "Total agents" },
    { icon: <Speed sx={{ color: "#6C2BD9", fontSize: "18px" }} />, value: "10", label: "Average calls handled" },
    { icon: <StarRate sx={{ color: "#6C2BD9", fontSize: "18px" }} />, value: "98%", label: "CSAT scores" },
    {
      icon: <AccessTime sx={{ color: "#6C2BD9", fontSize: "18px" }} />,
      value: "23 Min",
      label: "Average Handling Time",
    },
    { icon: <Timer sx={{ color: "#6C2BD9", fontSize: "18px" }} />, value: "30 Mins", label: "Average call duration" },
    {
      icon: <HourglassEmpty sx={{ color: "#6C2BD9", fontSize: "18px" }} />,
      value: "02 Mins",
      label: "Average hold time",
    },
  ]

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      <Container maxWidth={false} sx={{ py: 2, px: 1, maxWidth: "100%", margin: "0 auto" }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            bgcolor: "#6800E0",
            height: "36px", // Reduced height
            color: "white",
            fontSize: "15px", // Reduced font size
            p: 1.5, // Reduced padding
            marginBottom: "8px", // Reduced margin
            marginTop: "-10px", // Adjusted margin
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            gap: 0.8, // Reduced gap
          }}
        >
          <SupportAgentOutlinedIcon sx={{ fontSize: "18px" }} /> {/* Reduced icon size */}
          Agent Performance
        </Typography>

        {/* Filters */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: 1.5, // Reduced gap
            mb: 2, // Reduced margin
            alignItems: { xs: "stretch", lg: "center" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 1.5, // Reduced gap
              flex: 1,
              flexWrap: { sm: "wrap", lg: "nowrap" },
            }}
          >
            <FormControl sx={{ minWidth: { xs: "100%", sm: 180 }, flex: { sm: "1 1 calc(33.33% - 6px)", lg: 1 } }}>
              <StyledSelect value={callType} onChange={handleSelectChange(setCallType)} displayEmpty>
                <MenuItem value="" disabled>
                  Call Type
                </MenuItem>
                <MenuItem value="inbound">Inbound</MenuItem>
                <MenuItem value="outbound">Outbound</MenuItem>
              </StyledSelect>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: "100%", sm: 180 }, flex: { sm: "1 1 calc(33.33% - 6px)", lg: 1 } }}>
              <StyledSelect value={escalationStatus} onChange={handleSelectChange(setEscalationStatus)} displayEmpty>
                <MenuItem value="" disabled>
                  Escalation Status
                </MenuItem>
                <MenuItem value="escalated">Escalated</MenuItem>
                <MenuItem value="not-escalated">Not Escalated</MenuItem>
              </StyledSelect>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: "100%", sm: 180 }, flex: { sm: "1 1 calc(33.33% - 6px)", lg: 1 } }}>
              <StyledSelect value={qualityScore} onChange={handleSelectChange(setQualityScore)} displayEmpty>
                <MenuItem value="" disabled>
                  Quality Score
                </MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </StyledSelect>
            </FormControl>
          </Box>
          <Button
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
              height: "36px", // Reduced height
              fontSize: "13px", // Reduced font size
              px: 2, // Reduced padding
            }}
          >
            Download PDF
          </Button>
        </Box>

        {/* KPI Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", // Reduced min width
            gap: 1.5, // Reduced gap
            mb: 3,
          }}
        >
          {kpiData.map((kpi, index) => (
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
            borderRadius: "6px", // Reduced border radius
            mb: 2.5, // Reduced margin
            maxWidth: "100%",
            overflowX: "auto",
            "&::-webkit-scrollbar": {
              height: "6px", // Reduced scrollbar height
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#E5E7EB",
              borderRadius: "3px", // Reduced border radius
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
                      fontSize: "13px", // Reduced font size
                    }}
                  >
                    {header}
                  </StyledTableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {mockData.map((row) => (
                <TableRow key={row.id} sx={{ "&:hover": { bgcolor: "#F9FAFB" } }}>
                  <TableCell sx={{ padding: "8px 12px", fontSize: "13px" }}>{row.id}</TableCell>
                  <TableCell sx={{ padding: "8px 12px", fontWeight: 500, fontSize: "13px" }}>{row.name}</TableCell>
                  <TableCell sx={{ padding: "8px 12px", fontSize: "13px" }}>{row.totalCalls}</TableCell>
                  <TableCell sx={{ padding: "8px 12px", fontSize: "13px" }}>{row.qualityScore}</TableCell>
                  <TableCell sx={{ padding: "8px 12px", fontSize: "13px" }}>{row.avgHandlingTime}</TableCell>
                  <PercentageCell value={row.email}>
                    <span className="percentage">{row.email}%</span>
                  </PercentageCell>
                  <PercentageCell value={row.phoneNumber}>
                    <span className="percentage">{row.phoneNumber}%</span>
                  </PercentageCell>
                  <PercentageCell value={row.greeted}>
                    <span className="percentage">{row.greeted}%</span>
                  </PercentageCell>
                  <PercentageCell value={row.digitalSolution}>
                    <span className="percentage">{row.digitalSolution}%</span>
                  </PercentageCell>
                  <PercentageCell value={row.resolution}>
                    <span className="percentage">{row.resolution}%</span>
                  </PercentageCell>
                  <TableCell sx={{ padding: "8px 12px" }}>
                    <Rating
                      value={row.rating}
                      readOnly
                      precision={0.5}
                      size="small" // Changed to small size
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
      </Container>
    </Box>
  )
}
