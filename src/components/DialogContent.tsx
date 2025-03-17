import React from "react"
import { DialogContent, Typography } from "@mui/material"

const formatTranscript = (transcript: string): string => {
  const lines = transcript.split("\n").filter((line) => line.trim() !== "")
  let formattedOutput = ""
  const timeFormatter = (time: string): string => {
    const seconds = Math.floor(Number.parseFloat(time))
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`
  }

  // Loop through lines and parse the transcript
  for (let i = 0; i < lines.length; i++) {
    const speakerLine = lines[i]?.trim()
    const startTimeLine = lines[i + 1]?.trim()
    const endTimeLine = lines[i + 2]?.trim()

    // Check for the correct format
    const speakerMatch = speakerLine.match(/^(Agent(?: \d+)?|Customer):\s(.*)/)
    const startTimeMatch = startTimeLine?.match(/Start Time:\s([\d.]+)/)

    if (speakerMatch && startTimeMatch) {
      const speaker = speakerMatch[1]
      const dialogue = speakerMatch[2]
      const startTime = timeFormatter(startTimeMatch[1])

      // Add formatted text
      formattedOutput += `[${speaker} ${startTime}]<br>${dialogue}<br><br>`

      // Move to the next set of lines (skip start and end time lines)
      i += 2
    } else {
      console.log(`Skipping line: ${lines[i]}`)
    }
  }

  return formattedOutput
}

interface DialogContentComponentProps {
  selectedTranscript: string
}

const DialogContentComponent: React.FC<DialogContentComponentProps> = ({ selectedTranscript }) => {
  const formattedTranscript = React.useMemo(() => {
    return selectedTranscript ? formatTranscript(selectedTranscript) : ""
  }, [selectedTranscript])

  return (
    <DialogContent dividers>
      {formattedTranscript ? (
        <Typography
          component="div"
          dangerouslySetInnerHTML={{
            __html: formattedTranscript,
          }}
        />
      ) : (
        <Typography>No transcript available for this call.</Typography>
      )}
    </DialogContent>
  )
}

export default DialogContentComponent

