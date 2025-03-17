import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  TablePagination,
  CircularProgress,
  TextField,
  Box,
  Typography
} from '@mui/material';

interface CallData {
  filename: string;
  call_time: number;
  hold_time: number;
  route_time: number;
  resolution_time: number;
  greeting: string;
  phone_number: string;
  email_address: string;
  call_quality: string;
  case_type: string;
  resolution_confirmation: string;
  hold: string;
  hold_satisfaction: string;
  multiple_agents: string;
  escalation: string;
  call_tone: string;
  issue_discussed: string;
  complexity: string;
  issue_type: string;
  status_query: string;
  call_type: string;
  replacement_required: string;
  part_request: string;
  parts_dispatch: string;
  refund_required: string;
  field_service: string;
  digital_service: string;
}

export default function DashboardPage() {
  const [data, setData] = useState<CallData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/table-data');
      const result = await response.json();
      setData(result);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const filteredData = data.filter((row) =>
    Object.values(row).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Search"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Box>
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              <TableCell>Filename</TableCell>
              <TableCell>Call Time</TableCell>
              <TableCell>Hold Time</TableCell>
              <TableCell>Route Time</TableCell>
              <TableCell>Resolution Time</TableCell>
              <TableCell>Call Type</TableCell>
              <TableCell>Complexity</TableCell>
              <TableCell>Issue Discussed</TableCell>
              <TableCell>Call Tone</TableCell>
              <TableCell>Resolution Confirmation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                  <TableCell>{row.filename}</TableCell>
                  <TableCell>{row.call_time}</TableCell>
                  <TableCell>{row.hold_time}</TableCell>
                  <TableCell>{row.route_time}</TableCell>
                  <TableCell>{row.resolution_time}</TableCell>
                  <TableCell>{row.call_type}</TableCell>
                  <TableCell>{row.complexity}</TableCell>
                  <TableCell>{row.issue_discussed}</TableCell>
                  <TableCell>{row.call_tone}</TableCell>
                  <TableCell>{row.resolution_confirmation}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
}

