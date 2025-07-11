import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Select,
    MenuItem,
    FormControl,
    styled,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Alert,
    AlertTitle,
} from '@mui/material';
import { Download, CloudUploadOutlined, InsertChartOutlined, PhoneInTalkOutlined, VerifiedUserOutlined, CheckCircleOutlined, ContactSupportOutlined, Close, TextSnippet } from '@mui/icons-material';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import AssistantPhotoIcon from '@mui/icons-material/AssistantPhoto';

interface FileSystemHandle {
    kind: 'file' | 'directory';
    name: string;
}

interface FileSystemFileHandle extends FileSystemHandle {
    kind: 'file';
    getFile(): Promise<File>;
    createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream extends WritableStream {
    write(data: BufferSource | Blob | string): Promise<void>;
    seek(position: number): Promise<void>;
    truncate(size: number): Promise<void>;
}

interface SaveFilePickerOptions {
    suggestedName?: string;
    types?: {
        description?: string;
        accept: Record<string, string[]>;
    }[];
}

declare global {
    interface Window {
        showSaveFilePicker?: (options?: SaveFilePickerOptions) => Promise<FileSystemFileHandle>;
    }
}

interface DashboardData {
    summary: {
        total_calls: number;
        call_routing_accuracy: number;
        multiple_agents: number;
        call_hold_percentage: number;
        escalated_calls: number;
        resolution_confirmation: number;
        cs_portal_recommended: number;
    };
    complexity: {
        easy: number;
        intermediate: number;
        difficult: number;
    };
    call_hygiene: {
        greeting: number;
        phone_number: number;
        email: number;
    };
    tone_conversation: {
        positive: number;
        neutral: number;
        negative: number;
    };
    event_type: {
        [key: string]: number;
    };
    root_cause_analysis: {
        hold_time: number;
        resolution_time: number;
        route_time: number;
    };
    customer_service: {
        parts_request: number;
        digital_service: number;
        field_visits: number;
    };
}

interface TableData {
    [key: string]: string | number | boolean | undefined;
    key: string;
    label: string;
    width: string;
    backgroundColor: string;
    color: string;
    transcript?: string;
    transcriptStatus?: string;
}

const TableData: React.FC = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [tableData, setTableData] = useState<TableData[]>([]);
    const [modality, setModality] = useState('All');
    const [complexity, setComplexity] = useState('All');
    const [eventType, setEventType] = useState('All');
    const [loading, setLoading] = useState(true);
    const [showTable, setShowTable] = useState(false);
    const [openTranscriptDialog, setOpenTranscriptDialog] = useState(false);
    const [selectedTranscript, setSelectedTranscript] = useState('');
    const [selectedFilename, setSelectedFilename] = useState('');
    const [alert, setAlert] = useState({ show: false, message: '', type: 'info' });

    const StyledTableCell = styled(TableCell)<{ config: TableData }>(
        ({ theme, config }) => ({
          backgroundColor: config.backgroundColor,
          color: config.color,
          width: config.width,
          padding: theme.spacing(1),
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          letterSpacing: '0.05em',
        })
    );
      
    const DataTableCell = styled(TableCell)(({ theme }) => ({
        padding: theme.spacing(1),
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    }));

    useEffect(() => {
        fetchDashboardData();
        fetchTableData();
    }, [modality, complexity, eventType]);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/dashboard-data', {
                params: {
                    modality: modality === 'All' ? undefined : modality,
                    complexity: complexity === 'All' ? undefined : complexity,
                    eventType: eventType === 'All' ? undefined : eventType
                }
            });

            if (!response.data) {
                console.error('Invalid dashboard data received:', response.data);
                setDashboardData(null);
                return;
            }

            setDashboardData(response.data);
            console.log('Dashboard data:', response.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setDashboardData(null);
        }
    };

    const fetchTableData = async () => {
        try {
            const response = await axios.get('http://localhost:8000/table-data');
            console.log('Fetched table data:', response.data);
            
            // Fetch transcripts for each file
            const transcriptsResponse = await axios.get('http://localhost:8000/generate_transcripts', {
                params: { files: response.data.map((row: any) => row.filename).join(',') }
            });
            console.log('Fetched transcripts:', transcriptsResponse.data);

            // Merge table data with transcript data
            const mergedData = response.data.map((row: any) => {
                const transcriptInfo = transcriptsResponse.data.find((t: any) => t.filename === row.filename);
                return {
                    ...row,
                    transcript: transcriptInfo ? transcriptInfo.transcript : null,
                    transcriptStatus: transcriptInfo ? transcriptInfo.status : 'not found'
                };
            });

            setTableData(mergedData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching table data:', error);
            setLoading(false);
        }
    };

    const getCallTypeSummary = () => {
        const summary: { [key: string]: number } = {};
        tableData.forEach((row) => {
            const callType = row.call_type as string;
            if (callType) {
                summary[callType] = (summary[callType] || 0) + 1;
            }
        });
        return summary;
    };

    const handleOpenTranscript = (transcript: string | undefined, status: string, filename: string) => {
        if (status === 'completed' && transcript) {
            setSelectedTranscript(transcript);
            setSelectedFilename(filename);
            setOpenTranscriptDialog(true);
        } else {
            setAlert({
                show: true,
                message: status === 'processing' ? 'Transcript is still processing.' : 'No transcript available for this call.',
                type: 'info'
            });
        }
    };

    const downloadTranscript = async () => {
        if (selectedTranscript && selectedFilename) {
            try {
                // Check if the showSaveFilePicker API is available and is a function
                if (typeof window.showSaveFilePicker === 'function') {
                    const fileHandle = await window.showSaveFilePicker({
                        suggestedName: `${selectedFilename.replace(/\.[^/.]+$/, "")}_transcript.txt`,
                        types: [{
                            description: 'Text Files',
                            accept: {'text/plain': ['.txt']},
                        }],
                    });
                    const writable = await fileHandle.createWritable();
                    await writable.write(selectedTranscript);
                    await writable.close();
                } else {
                    // Fallback for browsers that don't support showSaveFilePicker
                    const element = document.createElement("a");
                    const file = new Blob([selectedTranscript], {type: 'text/plain'});
                    element.href = URL.createObjectURL(file);
                    element.download = `${selectedFilename.replace(/\.[^/.]+$/, "")}_transcript.txt`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                }
                setAlert({
                    show: true,
                    message: 'Transcript downloaded successfully.',
                    type: 'success'
                });
            } catch (error) {
                console.error('Error downloading transcript:', error);
                setAlert({
                    show: true,
                    message: 'Error downloading transcript. Please try again.',
                    type: 'error'
                });
            }
        }
    };

    const columns: TableData[] = [
        { key: 'filename', label: 'File Name', width: '8%', backgroundColor: '#90a4ae', color: '#ffffff' },
        { key: 'call_time', label: 'Call Time', width: '8%', backgroundColor: '#7C8F98', color: '#ffffff' },
        { key: 'hold_time', label: 'Hold Time', width: '8%', backgroundColor: '#90a4ae', color: '#ffffff' },
        { key: 'route_time', label: 'Route Time', width: '8%', backgroundColor: '#7C8F98', color: '#ffffff' },
        { key: 'resolution_time', label: 'Resolution Time', width: '10%', backgroundColor: '#90a4ae', color: '#ffffff' },
        { key: 'greeting', label: 'Greeting', width: '10%', backgroundColor: '#7C8F98', color: '#ffffff' },
        { key: 'phone_number', label: 'Phone Number', width: '10%', backgroundColor: '#90a4ae', color: '#ffffff' },
        { key: 'email_address', label: 'Email Address', width: '15%', backgroundColor: '#7C8F98', color: '#ffffff' },
        { key: 'call_quality', label: 'Call Quality', width: '8%', backgroundColor: '#90a4ae', color: '#ffffff' },
        { key: 'case_type', label: 'Case Type', width: '8%', backgroundColor: '#7C8F98', color: '#ffffff' },
        { key: 'resolution_confirmation', label: 'Resolution Confirmation', width: '10%', backgroundColor: '#90a4ae', color: '#ffffff' },
        { key: 'hold', label: 'Hold', width: '5%', backgroundColor: '#7C8F98', color: '#ffffff' },
        { key: 'hold_satisfaction', label: 'Hold Satisfaction', width: '10%', backgroundColor: '#90a4ae', color: '#ffffff' },
        { key: 'multiple_agents', label: 'Multiple Agents', width: '10%', backgroundColor: '#7C8F98', color: '#ffffff' },
        { key: 'escalation', label: 'Escalation', width: '10%', backgroundColor: '#90a4ae', color: '#ffffff' },
        { key: 'call_tone', label: 'Call Tone', width: '10%', backgroundColor: '#7C8F98', color: '#ffffff' },
        { key: 'issue_discussed', label: 'Issue Discussed', width: '10%', backgroundColor: '#90a4ae', color: '#ffffff' },
        { key: 'complexity', label: 'Complexity', width: '10%', backgroundColor: '#7C8F98', color: '#ffffff' },
        { key: 'issue_type', label: 'Issue Type', width: '10%', backgroundColor: '#90a4ae', color: '#ffffff' },
        { key: 'status_query', label: 'Status Query', width: '10%', backgroundColor: '#7C8F98', color: '#ffffff' },
        { key: 'call_type', label: 'Call Type', width: '10%', backgroundColor: '#90a4ae', color: '#ffffff' },
        { key: 'replacement_required', label: 'Replacement Required', width: '10%', backgroundColor: '#7C8F98', color: '#ffffff' },
        { key: 'part_request', label: 'Part Request', width: '10%', backgroundColor: '#90a4ae', color: '#ffffff' },
        { key: 'parts_dispatch', label: 'Parts Dispatch', width: '10%', backgroundColor: '#7C8F98', color: '#ffffff' },
        { key: 'refund_required', label: 'Refund Required', width: '10%', backgroundColor: '#90a4ae', color: '#ffffff' },
        { key: 'field_service', label: 'Field Service', width: '10%', backgroundColor: '#7C8F98', color: '#ffffff' },
        { key: 'digital_service', label: 'Digital Service', width: '10%', backgroundColor: '#90a4ae', color: '#ffffff' },
        { key: 'transcript', label: 'Transcript', width: '5%', backgroundColor: '#7C8F98', color: '#ffffff' },
    ];

    const renderKPI = (title: string, value: number, unit: string = '', icon: React.ReactNode) => (
        <Paper elevation={3} sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'start', gap: '28px' }}>
                {icon}
                <Typography sx={{ fontSize: '20px' }} variant="h6">
                    {value?.toFixed(0) || 0}{unit}
                </Typography>
            </Box>
            <Typography sx={{ fontSize: '10px' }} variant="body2">
                {title}
            </Typography>
        </Paper>
    );

    if (loading) {
        return (
          <TableContainer component={Paper} sx={{ maxWidth: '100%', margin: 'auto', mt: 4, minHeight: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress />
          </TableContainer>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
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
                <InsertChartOutlined />
                Call Analysis Dashboard
            </Typography>

            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, }}>
                        <Typography sx={{ minWidth: 120, textAlign: 'start', fontSize: '12px', color: '#b0b0b0' }}>Category</Typography>
                        <Typography sx={{ minWidth: 120, textAlign: 'start', fontSize: '12px', color: '#b0b0b0' }}>Complexity</Typography>
                        <Typography sx={{ minWidth: 120, textAlign: 'start', fontSize: '12px', color: '#b0b0b0' }}>Event Type</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                        <FormControl sx={{ minWidth: 120 }}>
                            <Select
                                sx={{ height: '30px', fontSize: '12px' }}
                                value={modality}
                                onChange={(e) => setModality(e.target.value as string)}
                                displayEmpty
                            >
                                <MenuItem value="" disabled>
                                    <em style={{ fontSize: '12px' }}>Select</em>
                                </MenuItem>
                                <MenuItem sx={{ fontSize: '12px' }} value="All">All</MenuItem>
                                <MenuItem sx={{ fontSize: '12px' }} value="CT">Ultrasound</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl sx={{ minWidth: 120 }}>
                            <Select
                                sx={{ height: '30px', fontSize: '12px' }}
                                value={complexity}
                                onChange={(e) => setComplexity(e.target.value as string)}
                                displayEmpty
                            >
                                <MenuItem value="" disabled>
                                    <em style={{ fontSize: '12px' }}>Select</em>
                                </MenuItem>
                                <MenuItem sx={{ fontSize: '12px' }} value="All">All</MenuItem>
                                <MenuItem sx={{ fontSize: '12px' }} value="Easy">Easy</MenuItem>
                                <MenuItem sx={{ fontSize: '12px' }} value="Medium">Medium</MenuItem>
                                <MenuItem sx={{ fontSize: '12px' }} value="Difficult">Difficult</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl sx={{ minWidth: 120 }}>
                            <Select
                                sx={{ height: '30px', fontSize: '12px' }}
                                value={eventType}
                                onChange={(e) => setEventType(e.target.value as string)}
                                displayEmpty
                            >
                                <MenuItem value="" disabled>
                                    <em style={{ fontSize: '12px' }}>Select</em>
                                </MenuItem>
                                <MenuItem sx={{ fontSize: '12px' }} value="All">All</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
                <Button
                    sx={{ height: '30px', bgcolor: '#0c0c0c', fontSize: '10px' }}
                    variant="contained"
                    onClick={() => navigate('/dashboard')}
                >
                    <SpaceDashboardIcon sx={{ height: '15px' }} />
                    Dashboard View
                </Button>
            </Box>

            <Grid container spacing={2} sx={{ justifyContent: 'space-between', flexWrap: 'nowrap', overflow: 'hidden', padding: '5px' }}>
                <Grid item sx={{ flex: '1 1 auto', textAlign: 'center', minWidth: '150px', maxWidth:'150px' }}>
                    {renderKPI('Total Calls', dashboardData?.summary?.total_calls || 0, '', <CloudUploadOutlined sx={{ fontSize: 20, color: '#6800e0' }} />)}
                </Grid>
                <Grid item sx={{ flex: '1 1 auto', textAlign: 'center', minWidth: '150px', maxWidth:'150px' }}>
                    {renderKPI('Call Routing Accuracy', dashboardData?.summary?.call_routing_accuracy || 0, '%', <InsertChartOutlined sx={{ fontSize: 20, color: '#6800e0' }} />)}
                </Grid>
                <Grid item sx={{ flex: '1 1 auto', textAlign: 'center', minWidth: '150px', maxWidth:'150px' }}>
                    {renderKPI('Multiple Agents Invited', dashboardData?.summary?.multiple_agents || 0, '%', <PhoneInTalkOutlined sx={{ fontSize: 20, color: '#6800e0' }} />)}
                </Grid>
                <Grid item sx={{ flex: '1 1 auto', textAlign: 'center', minWidth: '150px', maxWidth:'150px' }} >
                    {renderKPI('Call Hold', dashboardData?.summary?.call_hold_percentage || 0, '%', <VerifiedUserOutlined sx={{ fontSize: 20, color: '#6800e0' }} />)}
                </Grid>
                <Grid item sx={{ flex: '1 1 auto', textAlign: 'center', minWidth: '150px', maxWidth:'150px' }}>
                    {renderKPI('Escalated Calls', dashboardData?.summary?.escalated_calls || 0, '%', <CheckCircleOutlined sx={{ fontSize: 20, color: '#6800e0' }} />)}
                </Grid>
                <Grid item sx={{ flex: '1 1 auto', textAlign: 'center', minWidth: '150px', maxWidth:'150px' }}>
                    {renderKPI('Resolution Confirmation', dashboardData?.summary?.resolution_confirmation || 0, '%', <ContactSupportOutlined sx={{ fontSize: 20, color: '#6800e0' }} />)}
                </Grid>
                <Grid item sx={{ flex: '1 1 auto', textAlign: 'center', minWidth: '150px', maxWidth:'150px' }}>
                    {renderKPI('CS Portal Recommendation', dashboardData?.summary?.cs_portal_recommended || 0, '%', <AssistantPhotoIcon sx={{ fontSize: 20, color: '#6800e0' }} />)}
                </Grid>
            </Grid>

            <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2, maxWidth: '500px', margin: 'auto', mt: 4 }}>
                <Typography gutterBottom component="div" sx={{ p: '10px', fontSize: '14px' }}>
                    Call Type Summary
                </Typography>
                <Table sx={{ minWidth: 300 }} aria-label="call type summary table">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{fontWeight:700}}>Call Type</TableCell>
                            <TableCell align="right" sx={{fontWeight:700}}>Total Calls</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {Object.entries(getCallTypeSummary()).map(([type, count]) => (
                            <TableRow key={type}>
                                <TableCell component="th" scope="row">
                                    {type}
                                </TableCell>
                                <TableCell align="right">{count}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TableContainer component={Paper} sx={{ boxShadow: 3, borderRadius: 2, maxWidth: '1090px', margin: 'auto', mt: 4, overflowX: 'auto' }}>
                <Typography gutterBottom component="div" sx={{ p: '10px', fontSize: '14px' }}>
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
                        {tableData.map((row: any, index: number) => (
                            <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f5f5f5' } }}>
                                {columns.map((column) => (
                                    <DataTableCell key={`${index}-${column.key}`}>
                                        {column.key === 'transcript' ? (
                                            <IconButton onClick={() => handleOpenTranscript(row.transcript, row.transcriptStatus, row.filename)}>
                                                <TextSnippet color={row.transcriptStatus === 'completed' ? 'primary' : 'disabled'} />
                                            </IconButton>
                                        ) : (
                                            String(row[column.key] || '')
                                        )}
                                    </DataTableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Dialog 
                open={openTranscriptDialog} 
                onClose={() => setOpenTranscriptDialog(false)} 
                maxWidth="md" 
                fullWidth
            >
                <DialogTitle>
                    Transcript
                    <IconButton
                        onClick={() => setOpenTranscriptDialog(false)}
                        sx={{
                            position: 'absolute',
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
                        <Typography style={{ whiteSpace: 'pre-wrap' }}>
                            {selectedTranscript}
                        </Typography>
                    ) : (
                        <Typography>No transcript available.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={downloadTranscript}
                        disabled={!selectedTranscript}
                        sx={{
                            backgroundColor: '#6800E0',
                            color: 'white',
                            height: '35px',
                            fontSize: '12px',
                            '&:hover': {
                                backgroundColor: '#5600B8',
                            },
                            '&:disabled': {
                                backgroundColor: '#A9A9A9',
                                color: 'white',
                            },
                        }}
                    >
                        <Download sx={{ color: 'white', height: '16px', marginRight: '8px' }} />
                        Download
                    </Button>
                    <Button onClick={() => setOpenTranscriptDialog(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {alert.show && (
                <Alert sx={{ mt: 2 }}>
                    <AlertTitle>{alert.type === 'error' ? 'Error' : 'Info'}</AlertTitle>
                    {alert.message}
                </Alert>
            )}
        </Box>
    );
};

export default TableData;

