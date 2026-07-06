import { Box, Typography } from "@mui/material";
import loadingGif from "../../icons/loading.gif";

const Loader = () => {
  return (
    <Box
      sx={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: "20px",
        borderRadius: "5px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
        zIndex: (theme: any) => theme.zIndex.modal + 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          height: "100%",
        }}
      >
        <img width={50} height={50} src={loadingGif} alt="loading..." />
      </Box>
    </Box>
  );
};

export default Loader;
