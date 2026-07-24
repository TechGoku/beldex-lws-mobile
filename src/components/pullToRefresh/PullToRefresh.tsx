import React, { useRef, useState } from "react";
import { Box, CircularProgress } from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}

// Touch-driven pull-to-refresh for the dashboard. The native overscroll glow
// is disabled app-wide (overscroll-behavior-y: none in index.scss), so this
// owns the gesture: pull down while nothing is scrolled, release past the
// threshold to refresh.
export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);
  const armed = useRef(false);

  // Damped pull distance (px) that triggers a refresh — ~90px of raw drag.
  const THRESHOLD = 36;

  // Don't hijack the gesture when the touch began inside a scrolled-down
  // pane (e.g. the history list mid-scroll) — that swipe means "scroll up".
  const anyAncestorScrolled = (el: Element | null): boolean => {
    let node = el as HTMLElement | null;
    while (node) {
      if (node.scrollTop > 0) return true;
      node = node.parentElement;
    }
    return false;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (refreshing) return;
    armed.current = !anyAncestorScrolled(e.target as Element);
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!armed.current || refreshing || startY.current === null) return;
    const dy = e.touches[0].clientY - startY.current;
    setPull(dy > 0 ? Math.min(dy * 0.4, 90) : 0);
  };

  const handleTouchEnd = async () => {
    if (!armed.current || refreshing) {
      setPull(0);
      return;
    }
    if (pull >= THRESHOLD) {
      setRefreshing(true);
      setPull(44);
      try {
        await onRefresh();
      } finally {
        setTimeout(() => {
          setRefreshing(false);
          setPull(0);
        }, 500);
      }
    } else {
      setPull(0);
    }
  };

  return (
    <Box
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      sx={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
    >
      <Box
        sx={{
          height: `${pull}px`,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          transition: refreshing || pull === 0 ? "height 0.2s ease" : "none",
          color: (theme) => theme.palette.primary.main,
        }}
      >
        {refreshing ? (
          <CircularProgress size={20} thickness={5} />
        ) : (
          pull > 6 && (
            <ArrowDownwardIcon
              sx={{
                fontSize: "1.2rem",
                transition: "transform 0.15s ease",
                transform: pull >= 36 ? "rotate(180deg)" : "none",
              }}
            />
          )
        )}
      </Box>
      {children}
    </Box>
  );
}
