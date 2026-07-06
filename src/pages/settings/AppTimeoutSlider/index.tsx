import {  useState } from "react";
import "./style.scss";
import Slider from "@mui/material/Slider";
import Box from "@mui/material/Box";
import { Typography, colors } from "@mui/material";
import { useTheme } from "@emotion/react";
import userIdleTimerController from "./userIdleTimerController";
import { setIdleTimer } from "../../../stores/features/seedDetailSlice";
import { useAppDispatch } from "../../../stores/hooks";
import { useSelector } from "react-redux";
// import { useSelector } from "react-redux";
export default function AppTimeoutSlider() {
  const theme:any = useTheme();
  const walletDetails = useSelector((state: any) => state.seedDetailReducer);
  const dispatch = useAppDispatch();

  const [timer, setTimer] = useState<number>(walletDetails.timer);
  


  const handleChange = (event: Event, newValue: number | number[]) => {
    if (typeof newValue === "number") {
      setTimer(newValue);
      console.log("newValue newValue ::",newValue)
      dispatch(setIdleTimer(newValue))
    }
  };

  function valueLabelFormat(value: number) {
    return value < 60
      ? value + " s"
      : value === 1500
      ? "Never"
      : value / 60 + " m";
  }
  return (
      <Box
        display="flex"
        flexDirection="row"
        justifyContent="center"
        alignItems="center"
        className="AppTimeoutSlider"
      >
        <Typography sx={{ color: "rgb(141, 139, 141)", marginRight: "15px" }}>
          15s
        </Typography>
        <Slider
          className="slider"
          size="medium"
          aria-label="Small"
          valueLabelDisplay="on"
          track={false}
          value={timer}
          min={15}
          step={15}
          max={1500}
          onChange={handleChange}
          valueLabelFormat={valueLabelFormat}
          sx={{
            ".MuiSlider-valueLabel": {
              backgroundColor:theme.palette.success.main,
              color: theme.palette.text.primary
            },
            "& .MuiSlider-track": {
              border: "none",
            },
            "& .MuiSlider-thumb": {
              width: 16,
              height: 16,
              backgroundColor: "#fff",
              "&:before": {
                boxShadow: "0 4px 8px rgba(0,0,0,0.4)",
              },
              "&:hover, &.Mui-focusVisible, &.Mui-active": {
                boxShadow: "none",
              },
            },
          }}
        />
        <Typography sx={{ color: "rgb(141, 139, 141)", marginLeft: "15px" }}>
          Never
        </Typography>
      </Box>
    
  );
}
