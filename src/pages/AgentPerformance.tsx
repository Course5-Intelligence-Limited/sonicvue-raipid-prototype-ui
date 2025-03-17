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
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';

// Styled components
const StyledTableCell = styled(TableCell)(({ theme }) => ({
  color: "white",
  fontWeight: 500,
  padding: "12px 16px",
  fontSize: "14px",
  whiteSpace: "nowrap",
  "&:first-of-type": { width: "60px" },
  "&:nth-of-type(2)": { width: "150px" },
  "&:nth-of-type(3)": { width: "100px" },
  "&:nth-of-type(4)": { width: "120px" },
  "&:nth-of-type(5)": { width: "150px" },
  "&:last-child": { width: "60px" },
}))

const PercentageCell = styled(TableCell)<{ value: number }>(({ value }) => ({
  padding: "12px 16px",
  width: "100px",
  "& .percentage": {
    backgroundColor: value >= 100 ? "rgba(46, 204, 113, 0.1)" : "rgba(255, 99, 71, 0.1)",
    color: value >= 100 ? "rgb(46, 204, 113)" : "rgb(255, 99, 71)",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: 500,
  },
}))

const StyledSelect = styled(Select)({
  height: "40px",
  backgroundColor: "white",
  borderRadius: "8px",
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
      p: 2,
      border: "1px solid #E5E7EB",
      borderRadius: "8px",
      display: "flex",
      alignItems: "flex-start",
      gap: 2,
      height: "100%",
      minHeight: "90px",
    }}
  >
    <Box
      sx={{
        width: "36px",
        height: "36px",
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
      <Typography variant="h6" sx={{ fontSize: "20px", fontWeight: 600, mb: 0.5 }}>
        {value}
      </Typography>
      <Typography color="text.secondary" sx={{ fontSize: "13px" }}>
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
    { icon: <Phone sx={{ color: "#6C2BD9" }} />, value: "200", label: "Total calls" },
    { icon: <Person sx={{ color: "#6C2BD9" }} />, value: "20", label: "Total agents" },
    { icon: <Speed sx={{ color: "#6C2BD9" }} />, value: "10", label: "Average calls handled" },
    { icon: <StarRate sx={{ color: "#6C2BD9" }} />, value: "98%", label: "CSAT scores" },
    { icon: <AccessTime sx={{ color: "#6C2BD9" }} />, value: "23 Min", label: "Average Handling Time" },
    { icon: <Timer sx={{ color: "#6C2BD9" }} />, value: "30 Mins", label: "Average call duration" },
    { icon: <HourglassEmpty sx={{ color: "#6C2BD9" }} />, value: "02 Mins", label: "Average hold time" },
  ]

  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      <Container maxWidth={false} sx={{ py: 3, px: 0, maxWidth: "100%", margin: "0 auto" }}>
        <Typography variant="h4" gutterBottom sx={{
          bgcolor: '#6800E0',
          height: '40px',
          color: 'white',
          fontSize: '16px',
          p: 2,
          marginBottom: '10px',
          marginTop: '-15px',
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <SupportAgentOutlinedIcon />
          Agent Performance
        </Typography>

        {/* Filters */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: 2,
            mb: 3,
            alignItems: { xs: "stretch", lg: "center" },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              flex: 1,
              flexWrap: { sm: "wrap", lg: "nowrap" },
            }}
          >
            <FormControl sx={{ minWidth: { xs: "100%", sm: 200 }, flex: { sm: "1 1 calc(33.33% - 8px)", lg: 1 } }}>
              <StyledSelect value={callType} onChange={handleSelectChange(setCallType)} displayEmpty>
                <MenuItem value="" disabled>
                  Call Type
                </MenuItem>
                <MenuItem value="inbound">Inbound</MenuItem>
                <MenuItem value="outbound">Outbound</MenuItem>
              </StyledSelect>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: "100%", sm: 200 }, flex: { sm: "1 1 calc(33.33% - 8px)", lg: 1 } }}>
              <StyledSelect value={escalationStatus} onChange={handleSelectChange(setEscalationStatus)} displayEmpty>
                <MenuItem value="" disabled>
                  Escalation Status
                </MenuItem>
                <MenuItem value="escalated">Escalated</MenuItem>
                <MenuItem value="not-escalated">Not Escalated</MenuItem>
              </StyledSelect>
            </FormControl>
            <FormControl sx={{ minWidth: { xs: "100%", sm: 200 }, flex: { sm: "1 1 calc(33.33% - 8px)", lg: 1 } }}>
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
            startIcon={<Download />}
            sx={{
              bgcolor: "#7C3AED",
              "&:hover": {
                bgcolor: "#6D28D9",
              },
              textTransform: "none",
              minWidth: { xs: "100%", md: "auto" },
              borderRadius: "5px",
              height: "40px",
            }}
          >
            Download PDF
          </Button>
        </Box>

        {/* KPI Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 2,
            mb: 4,
          }}
        >
          {kpiData.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </Box>

        {/* Table */}
        <Typography variant="h6" sx={{ mb: 2, fontSize: "16px", fontWeight: 500 }}>
          Quality audit scores
        </Typography>

        <TableContainer
          component={Paper}
          sx={{
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            mb: 3,
            maxWidth: "100%",
            overflowX: "auto",
            "&::-webkit-scrollbar": {
              height: "8px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#E5E7EB",
              borderRadius: "4px",
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
                      fontSize: "14px",
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
                  <TableCell>{row.id}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                  <TableCell>{row.totalCalls}</TableCell>
                  <TableCell>{row.qualityScore}</TableCell>
                  <TableCell>{row.avgHandlingTime}</TableCell>
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
                  <TableCell>
                    <Rating
                      value={row.rating}
                      readOnly
                      precision={0.5}
                      sx={{
                        "& .MuiRating-iconFilled": {
                          color: "#7C3AED",
                        },
                      }}
                    />
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

