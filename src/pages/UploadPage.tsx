import { useState, useCallback, useRef, useEffect } from "react"
import JSZip from "jszip"
import { Link, useLocation } from "react-router-dom"
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton,
  Grid,
  Card,
  CardContent,
  CardActions,
  Tooltip,
} from "@mui/material"
import {
  CloudUpload,
  AudioFile,
  InsertChartOutlined,
  Check,
  Download,
  FileUpload,
  Close,
  Description as DescriptionIcon,
  Close as CloseIcon,
  GetApp as GetAppIcon,
} from "@mui/icons-material"
import { useDropzone } from "react-dropzone"
import axios from "axios"
import DialogContentComponent from "../components/DialogContent"
import { useUpload } from "../context/FileContext"

interface FileUpload {
  file: File
  progress: number
  status: "Ready" | "uploading" | "success" | "error" | "processing"
  name: string
}

interface TranscriptResponse {
  filename: string
  transcript: string | null
  transcript_file: string
  status: "processing" | "completed" | "error"
}

export default function UploadPage() {
  console.log("UploadPage is rendering")
  const location = useLocation()
  const { files, setFiles, transcripts, setTranscripts, filesUploaded, setFilesUploaded } = useUpload()
  const [openTranscriptDialog, setOpenTranscriptDialog] = useState(false)
  const [selectedTranscript, setSelectedTranscript] = useState("")
  const [loadingTranscripts, setLoadingTranscripts] = useState(false)
  const [open, setOpen] = useState(false)
  const [alert, setAlert] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
    show: false,
    message: "",
    type: "success",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const batchFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    console.log("UploadPage mounted")
    return () => {
      console.log("UploadPage unmounted")
    }
  }, [])

  useEffect(() => {
    console.log("UploadPage state updated:", { files, transcripts, filesUploaded, pathname: location.pathname })
  }, [files, transcripts, filesUploaded, location.pathname])

  const showTranscript = (transcript: string) => {
    setSelectedTranscript(transcript)
    setOpenTranscriptDialog(true)
  }

  const downloadAllTranscriptsAsZip = async (transcripts: TranscriptResponse[]) => {
    const zip = new JSZip()

    transcripts.forEach((transcript) => {
      if (transcript.status === "completed" && transcript.transcript) {
        zip.file(`${transcript.filename}.txt`, transcript.transcript)
      }
    })

    try {
      const zipBlob = await zip.generateAsync({ type: "blob" })

      if ("showSaveFilePicker" in window) {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: "transcripts.zip",
          types: [
            {
              description: "ZIP Files",
              accept: { "application/zip": [".zip"] },
            },
          ],
        })

        const writable = await handle.createWritable()
        await writable.write(zipBlob)
        await writable.close()
      }
    } catch (error) {
      console.error("Failed to generate or download ZIP file:", error)
    }
  }

  const downloadTranscriptAsPdf2 = async (transcript: string, filename: string) => {
    if ("showSaveFilePicker" in window) {
      try {
        const handle = await (window as any).showSaveFilePicker({
          suggestedName: `${filename}.txt`,
          types: [
            {
              description: "Text File",
              accept: { "text/plain": [".txt"] },
            },
          ],
        })
        const writable = await handle.createWritable()
        await writable.write(transcript)
        await writable.close()
      } catch (err) {
        console.error("Save operation was canceled or failed", err)
      }
    }
  }

  const handleBrowseClick = () => {
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleSingleUpload = () => {
    handleClose()
    fileInputRef.current?.click()
  }

  const handleBatchUpload = () => {
    handleClose()
    batchFileInputRef.current?.click()
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (files.length + acceptedFiles.length > 5) {
        setAlert({
          show: true,
          message: "You can only upload up to 5 files at a time.",
          type: "error",
        })
        return
      }

      setFiles((prevFiles) => {
        const newFiles = acceptedFiles.map((file) => ({
          file,
          progress: 0,
          status: "Ready" as const,
          name: file.name,
        }))
        return [...prevFiles, ...newFiles]
      })
    },
    [files, setFiles],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/mpeg": [".mp3"],
      "audio/wav": [".wav"],
    },
    maxFiles: 5,
    noClick: true,
  })

  const handleUpload = async () => {
    const pendingFiles = files.filter((f) => f.status === "Ready")
    console.log("Files to upload:", pendingFiles)

    const formData = new FormData()

    pendingFiles.forEach((fileUpload) => {
      formData.append("files", fileUpload.file)
    })

    setFiles((prevFiles) => prevFiles.map((f) => (f.status === "Ready" ? { ...f, status: "uploading" } : f)))

    try {
      const response = await axios.post("http://localhost:8080/upload", formData, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = (progressEvent.loaded / progressEvent.total) * 100
            setFiles((prevFiles) =>
              prevFiles.map((f) => (f.status === "uploading" ? { ...f, progress: Math.round(progress) } : f)),
            )
          }
        },
      })

      setFiles((prevFiles) => prevFiles.map((f) => (f.status === "uploading" ? { ...f, status: "success" } : f)))

      setAlert({
        show: true,
        message: "Files uploaded successfully!",
        type: "success",
      })
      setFilesUploaded(true)
    } catch (error) {
      setFiles((prevFiles) => prevFiles.map((f) => (f.status === "uploading" ? { ...f, status: "error" } : f)))

      setAlert({
        show: true,
        message: "Error uploading files. Please try again.",
        type: "error",
      })
    }
  }

  const handleGenerateTranscripts = async () => {
    try {
      const uploadedFiles = files.filter((f) => f.status === "success").map((f) => f.file.name)
      setLoadingTranscripts(true)
      const response = await axios.get("http://localhost:8080/generate-transcripts", {
        params: {
          files: uploadedFiles.join(","),
        },
      })

      setTranscripts(response.data)
    } catch (error) {
      setAlert({
        show: true,
        message: "Error generating transcripts. Please try again.",
        type: "error",
      })
    } finally {
      setLoadingTranscripts(false)
    }
  }

  const removeFile = (fileToRemove: File) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f.file !== fileToRemove))
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          bgcolor: "#6800E0",
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
        <CloudUpload />
        Upload Files
      </Typography>

      {files.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontSize={"14px"} gutterBottom sx={{ color: "#333", fontWeight: "bold" }}>
            Files (add up to 5 files)
          </Typography>
          <List>
            {files.map((fileUpload, index) => (
              <ListItem
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  height: "60px",
                  padding: "8px 16px",
                  border: "1px solid #E0E0E0",
                  borderRadius: "8px",
                  mb: 2,
                  boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <AudioFile sx={{ color: "#007AFF", fontSize: "24px" }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ color: "#333", fontSize: "14px", fontWeight: 500 }}>
                      {fileUpload.file.name}
                    </Typography>
                  }
                  secondary={
                    fileUpload.status === "uploading" ? (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={fileUpload.progress}
                          sx={{
                            flexGrow: 1,
                            height: 8,
                            borderRadius: "4px",
                            backgroundColor: "#F0F0F0",
                            "& .MuiLinearProgress-bar": {
                              backgroundColor: "#0EAB03",
                            },
                          }}
                        />
                        <Typography variant="body2" sx={{ color: "#333", minWidth: "45px" }}>
                          {`${fileUpload.progress}%`}
                        </Typography>
                      </Box>
                    ) : fileUpload.status === "success" ? (
                      <Box sx={{ display: "flex", alignItems: "center", mt: 1, color: "#4CAF50" }}>
                        <Check sx={{ mr: 0.5 }} />
                        <Typography variant="body2" sx={{ fontSize: "12px", fontWeight: 500 }}>
                          Uploaded successfully!
                        </Typography>
                      </Box>
                    ) : (
                      fileUpload.status
                    )
                  }
                />
                <IconButton onClick={() => removeFile(fileUpload.file)} sx={{ color: "#888" }}>
                  <Close />
                </IconButton>
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!files.some((f) => f.status === "Ready" || f.status === "uploading")}
              sx={{
                backgroundColor: "#6800E0",
                height: "35px",
                fontSize: "12px",
                ":disabled": { backgroundColor: "#A9A9A9", color: "white" },
              }}
            >
              Upload Files
            </Button>
            <Button
              variant="contained"
              onClick={handleGenerateTranscripts}
              disabled={
                !filesUploaded ||
                files.some((f) => f.status === "uploading" || f.status === "processing") ||
                loadingTranscripts
              }
              sx={{
                backgroundColor: filesUploaded ? "#6800E0" : "#A9A9A9",
                height: "35px",
                fontSize: "12px",
                color: "white",
                ":disabled": { backgroundColor: "#A9A9A9" },
              }}
            >
              {loadingTranscripts ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Generate Transcripts"}
            </Button>
            <Button
              component={Link}
              to="/dashboard"
              disabled={!filesUploaded}
              sx={{
                backgroundColor: filesUploaded ? "#0c0c0c" : "#A9A9A9",
                height: "35px",
                fontSize: "12px",
                color: "white",
                ":disabled": { backgroundColor: "#A9A9A9", color: "white" },
              }}
            >
              <InsertChartOutlined sx={{ height: "16px", mr: 1 }} />
              Call Analysis
            </Button>
          </Box>
        </Box>
      )}

      {transcripts.length > 0 && (
        <Box sx={{ mt: 4, marginBottom: "30px", bgcolor: "#f0f0f0", padding: "30px", borderRadius: "10px" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h5" gutterBottom sx={{ color: "#6800E0", flexGrow: 1, fontSize: "16px" }}>
              Generated Transcripts
            </Typography>
          </Box>

          <Grid container spacing={2}>
            {transcripts.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.filename}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    "&:hover": { boxShadow: 6 },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontSize={"16px"} gutterBottom>
                      {item.filename}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontSize={"12px"} noWrap>
                      {item.transcript?.substring(0, 100)}...
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Tooltip title="View Transcript">
                      <IconButton color="primary" onClick={() => item.transcript && showTranscript(item.transcript)}>
                        <DescriptionIcon sx={{ color: "#8C51E1" }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Download Transcript">
                      <IconButton
                        color="secondary"
                        onClick={() => item.transcript && downloadTranscriptAsPdf2(item.transcript, item.filename)}
                      >
                        <GetAppIcon sx={{ color: "#8C51E1" }} />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Dialog open={openTranscriptDialog} onClose={() => setOpenTranscriptDialog(false)} maxWidth="md" fullWidth>
            <DialogTitle sx={{ m: 0, p: 2 }}>
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
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <DialogContentComponent selectedTranscript={selectedTranscript} />
            </DialogContent>
            <DialogActions>
              <Button
                sx={{ backgroundColor: "#6800E0", color: "white", height: "35px", fontSize: "12px" }}
                onClick={() => {
                  const transcript = transcripts.find((t) => t.transcript === selectedTranscript)
                  if (transcript) {
                    downloadTranscriptAsPdf2(transcript.transcript || "", transcript.filename)
                  }
                }}
              >
                <Download sx={{ color: "white", height: "16px" }} />
                Download
              </Button>
              <Button onClick={() => setOpenTranscriptDialog(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", marginTop: "30px" }}>
            <Button
              variant="contained"
              startIcon={<GetAppIcon />}
              onClick={() => downloadAllTranscriptsAsZip(transcripts)}
              sx={{ backgroundColor: "#6800E0" }}
            >
              Download All
            </Button>
            <Button
              variant="outlined"
              startIcon={<CloseIcon />}
              onClick={() => setTranscripts([])}
              sx={{
                borderColor: "#6800E0",
                color: "#6800E0",
                "&:hover": {
                  borderColor: "#6800E0",
                  backgroundColor: "rgba(104, 0, 224, 0.04)",
                },
              }}
            >
              Clear All
            </Button>
          </Box>
        </Box>
      )}

      <Paper
        {...getRootProps()}
        sx={{
          p: 6,
          textAlign: "center",
          cursor: "pointer",
          border: "2px dashed #6800E0",
          borderRadius: 2,
          bgcolor: "white",
          "&:hover": { borderColor: "#4a00a0" },
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: "#6800E0", mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? "Drop the files here" : "Drag and drop file here"}
        </Typography>
        <Typography variant="body1" gutterBottom>
          or
        </Typography>
        <Button variant="contained" onClick={handleBrowseClick} sx={{ mt: 2, backgroundColor: "#6800E0" }}>
          Browse Files
        </Button>
        <Dialog
          open={open}
          onClose={handleClose}
          sx={{
            "& .MuiDialog-paper": {
              width: "500px",
              height: "250px",
            },
          }}
        >
          <DialogTitle>Upload Files</DialogTitle>
          <DialogContent>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={6}>
                <IconButton
                  onClick={handleSingleUpload}
                  sx={{
                    border: "1px solid #6800E0",
                    width: "100%",
                    height: "100px",
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: 2,
                  }}
                >
                  <FileUpload sx={{ fontSize: 40, color: "#6800E0" }} />
                  <Typography color="#6800E0" noWrap>
                    Single Upload
                  </Typography>
                </IconButton>
              </Grid>
              <Grid item xs={6}>
                <IconButton
                  onClick={handleBatchUpload}
                  sx={{
                    border: "1px solid #6800E0",
                    width: "100%",
                    height: "100px",
                    borderRadius: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: 2,
                  }}
                >
                  <FileUpload sx={{ fontSize: 40, color: "#6800E0" }} />
                  <Typography color="#6800E0">Batch Upload</Typography>
                  <Typography variant="caption" color="textSecondary" sx={{ mx: "auto" }}>
                    Upload - Max 5 Files
                  </Typography>
                </IconButton>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Typography variant="caption" color="textSecondary" sx={{ mx: "auto" }}>
              File format .MP3, WAV.
            </Typography>
          </DialogActions>
        </Dialog>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={(e) => e.target.files && onDrop(Array.from(e.target.files))}
          accept=".mp3,.wav"
        />
        <input
          type="file"
          ref={batchFileInputRef}
          style={{ display: "none" }}
          multiple
          onChange={(e) => e.target.files && onDrop(Array.from(e.target.files))}
          accept=".mp3,.wav"
        />
        <Typography variant="body2" sx={{ mt: 2, color: "text.secondary" }}>
          Max file size of 25MB - File format .MP3, WAV.
        </Typography>
      </Paper>

      <Snackbar open={alert.show} autoHideDuration={6000} onClose={() => setAlert({ ...alert, show: false })}>
        <Alert severity={alert.type} onClose={() => setAlert({ ...alert, show: false })}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

