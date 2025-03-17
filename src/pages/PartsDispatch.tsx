import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  LinearProgress,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

const leaderboardData = [
  {
    id: 1,
    name: "Harrison",
    points: 258,
    progress: 100,
    targetMessage: "On target to hit: 28",
    multiplier: "x2",
    avatar: "/avatar1.png",
    rating: 5,
  },
  {
    id: 2,
    name: "Brittany",
    points: 223,
    progress: 90,
    targetMessage: "90% of target",
    multiplier: "",
    avatar: "/avatar2.png",
    rating: 4,
  },
  {
    id: 3,
    name: "Rebecca",
    points: 133,
    progress: 54,
    targetMessage: "54% of target",
    multiplier: "",
    avatar: "/avatar3.png",
    rating: 4,
  },
  {
    id: 4,
    name: "Daniel",
    points: 73,
    progress: 30,
    targetMessage: "30% of target",
    multiplier: "",
    avatar: "/avatar4.png",
    rating: 3,
  },
];

type ProgressBarProps = {
  progress: number;
};

const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => (
  <Box sx={{ width: "100%", mt: 0.5 }}>
    <LinearProgress
      variant="determinate"
      value={progress}
      sx={{
        height: 4,
        borderRadius: 2.5,
        backgroundColor: "#d3d3d3",
        "& .MuiLinearProgress-bar": {
          borderRadius: 2.5,
          backgroundColor: progress >= 70 ? "#4caf50" : "#ff9800",
        },
      }}
    />
  </Box>
);

const PartsDispatch = () => {
  return (
    <Card
      sx={{
        maxWidth: 300, // Reduced from 600
        margin: "10px auto", // Reduced from 20px
        boxShadow: 2, // Reduced shadow depth
        borderRadius: 1.5, // Reduced from 3
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {leaderboardData.map((player, index) => (
          <Box
            key={player.id}
            sx={{
              display: "flex",
              alignItems: "center",
              p: 1, // Reduced from 2
              backgroundColor: index === 0 ? "#2c2c54" : "#f5f5f5",
              color: index === 0 ? "#fff" : "#000",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", mr: 1 }}>
              <Typography
                variant="subtitle1" // Smaller font size
                sx={{
                  fontWeight: "bold",
                  mr: 1, // Reduced from 2
                  color: index === 0 ? "#FFD700" : "#000",
                }}
              >
                {index + 1}
                {index === 0 && "st"}
                {index === 1 && "nd"}
                {index === 2 && "rd"}
                {index > 2 && "th"}
              </Typography>
              <Avatar
                src={player.avatar}
                alt={player.name}
                sx={{
                  width: 24, // Reduced from 48
                  height: 24, // Reduced from 48
                  border: index === 0 ? "1px solid #FFD700" : "none",
                }}
              />
            </Box>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1">{player.name}</Typography>
              <Typography
                variant="caption" // Smaller font size
                sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
              >
                <StarIcon fontSize="small" color="warning" />{" "}
                {`${player.rating} Stars`}
              </Typography>
              <Typography variant="caption">{player.targetMessage}</Typography>
              <ProgressBar progress={player.progress} />
            </Box>
            <Box sx={{ ml: 1, textAlign: "center" }}>
              {player.multiplier && (
                <Typography
                  variant="caption" // Smaller font size
                  sx={{ fontWeight: "bold", color: "#00e676" }}
                >
                  {player.multiplier}
                </Typography>
              )}
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                {player.points}
              </Typography>
            </Box>
          </Box>
        ))}
      </CardContent>
    </Card>
  );
};

export default PartsDispatch;
