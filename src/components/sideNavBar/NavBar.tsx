import React, { useEffect } from "react";
import { useMediaQuery, useTheme } from '@mui/material';
import List from "@mui/material/List";
import Box from "@mui/material/Box";
import { useNavigate, useLocation } from "react-router-dom";
import ListItemButton from "@mui/material/ListItemButton";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";
import InboxIcon from "@mui/icons-material/Inbox";
import DraftsIcon from "@mui/icons-material/Drafts";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import Privacy from '../../icons/Privacy';
import Term from '../../icons/Terms';
import Support from '../../icons/Support';
import Website from '../../icons/Website';
import MyWallet from '../../icons/MyWallet';
import { ColorContext } from '../../ColorContext';
import { useSelector } from "react-redux";

export default function NavBar() {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const walletDetails = useSelector((state: any) => state.seedDetailReducer);
  const routerPath = ['/mywallet', '/privacy', '/terms', "/support"]
  const theme = useTheme();
  const isMobileMode = useMediaQuery(theme.breakpoints.down("sm"));
  useEffect(() => {
    const routerIndex = routerPath.findIndex((item: string) => item === location.pathname);
    setSelectedIndex(routerIndex);
  }, []);
  const handleListItemClick = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number
  ) => {
    setSelectedIndex(index);
    if (index < 5) navigate(routerPath[index]);

  };

  const getTextColor = (theme: any, selectedInd: number) => {
    if (theme.palette.mode === 'dark') {
      return (selectedIndex === selectedInd ? "white" : theme.palette.text.secondary)
    } else {
      return selectedIndex === selectedInd ? theme.palette.text.primary : "#222222"  //theme.palette.text.secondary
    }
  }
  if (isMobileMode) {
    return <></>
  }
  return (
    <Box sx={{ minWidth: '225px', background: (theme) => theme.palette.background.paper, borderRadius: '0px' }}>
      <List
        sx={{
          // width: "100%",
          // maxWidth: 360,
          padding: 2,
          bgcolor: (theme) => theme.palette.background.paper,
          borderRadius: '0px',
          height: "100%",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <ListItemButton
          selected={selectedIndex === 0}
          onClick={(event) => handleListItemClick(event, 0)}
          sx={{
            m: 0.5,
            p: 2,
            maxHeight: "60px",
            "&.Mui-selected": {
              background: (theme) => theme.palette.common.white,
              borderRadius: "0px",
              "&:hover": {
                background: (theme) => theme.palette.common.white
              }
            },
            borderRadius: "0px"
          }}
        >
          <ListItemIcon sx={{ minWidth: '40px' }}>
            <MyWallet
              sx={{ fill: selectedIndex === 0 ? "#3ec745" : (theme: any) => theme.palette.secondary.light }}
            />
          </ListItemIcon>
          <ListItemText
            sx={{
              color: (theme) => getTextColor(theme, 0),
              ".MuiListItemText-primary": {
                fontWeight: selectedIndex === 0 ? "600" : "400"
              }
            }}
            primary="Wallet"
          />
          {selectedIndex === 0 && (
            <KeyboardArrowRightRoundedIcon sx={{ fill: getTextColor(theme, 0) }} />
          )}
        </ListItemButton>
        <ListItemButton
          selected={selectedIndex === 1}
          onClick={(event) => handleListItemClick(event, 1)}
          sx={{
            m: 0.5,
            p: 2,
            maxHeight: "60px",
            "&.Mui-selected": {
              background: (theme) => theme.palette.common.white,
              borderRadius: "0px",
              "&:hover": {
                background: (theme) => theme.palette.common.white
              }
            },
            borderRadius: "0px",
          }}
        >
          <ListItemIcon sx={{ minWidth: '40px' }}>
            {/* <DraftsIcon
              sx={{ fill: selectedIndex === 1 ? "#3ec745" : "#EBEBEB" }}
            /> */}
            <Privacy
              sx={{ fill: selectedIndex === 1 ? "#3ec745" : (theme: any) => theme.palette.secondary.light }}
            />
          </ListItemIcon>
          <ListItemText
            sx={{
              color: (theme) => getTextColor(theme, 1),
              ".MuiListItemText-primary": {
                fontWeight: selectedIndex === 1 ? "600" : "400"
              }
            }}
            primary="Privacy"
          />
          {selectedIndex === 1 && (
            <KeyboardArrowRightRoundedIcon sx={{ fill: getTextColor(theme, 1) }} />
          )}
        </ListItemButton>
        <ListItemButton
          selected={selectedIndex === 2}
          sx={{
            m: 0.5,
            p: 2,
            maxHeight: "60px",
            "&.Mui-selected": {
              background: (theme) => theme.palette.common.white,
              borderRadius: "0px",
              "&:hover": {
                background: (theme) => theme.palette.common.white
              }
            },
            borderRadius: "0px"

          }}
          onClick={(event) => handleListItemClick(event, 2)}
        >
          <ListItemIcon sx={{ minWidth: '40px' }}>
            <Term
              sx={{ fill: selectedIndex === 2 ? "#3ec745" : (theme: any) => theme.palette.secondary.light }}
            />
          </ListItemIcon>
          <ListItemText
            sx={{
              color: (theme) => getTextColor(theme, 2),
              ".MuiListItemText-primary": {
                fontWeight: selectedIndex === 2 ? "600" : "400"
              }
            }}
            primary="Terms"
          />
          {selectedIndex === 2 && (
            <KeyboardArrowRightRoundedIcon sx={{ fill: getTextColor(theme, 2) }} />
          )}
        </ListItemButton>
        <ListItemButton
          selected={selectedIndex === 3}
          sx={{
            m: 0.5,
            p: 2,
            mb: "auto",
            maxHeight: "60px",
            "&.Mui-selected": {
              background: (theme) => theme.palette.common.white,
              borderRadius: "0px",
              "&:hover": {
                background: (theme) => theme.palette.common.white
              }
            },
            borderRadius: "0px"
          }}
          onClick={(event) => handleListItemClick(event, 3)}
        >
          <ListItemIcon sx={{ minWidth: '40px' }}>
            <Support
              sx={{ fill: selectedIndex === 3 ? "#3ec745" : (theme: any) => theme.palette.secondary.light }}
            />
          </ListItemIcon>
          <ListItemText
            sx={{
              color: (theme) => getTextColor(theme, 3),
              ".MuiListItemText-primary": {
                fontWeight: selectedIndex === 3 ? "600" : "400"
              }
            }}
            primary="Support"
          />
          {selectedIndex === 3 && (
            <KeyboardArrowRightRoundedIcon sx={{ fill: getTextColor(theme, 3) }} />
          )}
        </ListItemButton>
        {/* <ListItemButton
          selected={selectedIndex === 4}
          sx={{
            m: 0.5,
            mb: "auto",
            p: 2,
            maxHeight: "60px",
            "&.Mui-selected": {
              background: (theme) => theme.palette.common.white,
              borderRadius: "0px",
              "&:hover": {
                background: (theme) => theme.palette.common.white
              }
            },
           borderRadius: "0px",
          }}
          onClick={(event) => handleListItemClick(event, 4)}
        >
          <ListItemIcon sx={{ minWidth: '40px' }}>
            <Website
              sx={{ fill: selectedIndex === 4 ? "#3ec745" : (theme: any) => theme.palette.secondary.light }}
            />
          </ListItemIcon>
          <ListItemText
            sx={{
              color: (theme) => getTextColor(theme, 4),
              ".MuiListItemText-primary": {
                fontWeight: selectedIndex === 4 ? "600" : "400"
              }
            }}
            primary="Website"
          />
          {selectedIndex === 4 && (
            <KeyboardArrowRightRoundedIcon sx={{ fill: getTextColor(theme, 4) }} />
          )}
        </ListItemButton> */}
      </List>
    </Box>
  );
}
