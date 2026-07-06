import React, { useEffect } from "react";

import { Box, Pagination, PaginationItem } from "@mui/material";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import theme from "../../theme/theme";

export default function CustomPagination(props: any) {
  const { pagenatedTxnHistory, setPage, page } = props;
  const handleChange = (event: any, value: any) => {
    setPage(value);
  };

  return (
    <div>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          "& .MuiPagination-root": {
            button: {
              // color: "#1FCC2F !important",
              fontWeight: 600,
            },
            "& .MuiPaginationItem-root": {
              color: "#1FCC2F ",
              width: "20px",
              minWidth: "unset",
              padding: "0",
              margin: "0",
            },
            "& .Mui-disabled": {
              color: "#8787A8 !important",
            },
            "& .Mui-selected": {
              color: "#303041",
              backgroundColor: "#D1D1D3",
              height: "20px",
            },
            "& .Mui-selected:hover":{
               backgroundColor:'#D1D1D3 !important'
            },
            // "& .MuiPaginationItem-firstLast":{
            //   color: 'white'

            // },
            "& .MuiPaginationItem-icon": {
              fill: (theme: any) =>
                theme.palette.mode === "dark" ? "#fff" : "#000",
            },
            color: "#1FCC2F !important",
          },
        }}
      >
        <Pagination
          sx={{ color: "#1FCC2F" }}
          size="large"
          renderItem={(item) => (
            <PaginationItem
              slots={{
                first: KeyboardDoubleArrowLeftIcon,
                last: KeyboardDoubleArrowRightIcon,
              }}
              {...item}
            />
          )}
          page={page}
          onChange={handleChange}
          count={pagenatedTxnHistory.length}
          showFirstButton
          showLastButton
          color="secondary"
        />
      </Box>
    </div>
  );
}
