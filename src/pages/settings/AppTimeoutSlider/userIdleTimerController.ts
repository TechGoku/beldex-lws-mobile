import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../../stores/hooks";
import { lockApp, securitySelector } from "../../../stores/features/securitySlice";

// Auto-lock controller. After `autoLockSeconds` of no interaction it LOCKS the
// app (shows the PIN/biometric screen) instead of logging the wallet out.
// lockApp() is itself a no-op unless a PIN is configured, so with no app lock
// set the idle timer effectively does nothing.
export default function userIdleTimerController(): void {
  const dispatch = useAppDispatch();
  const security = useAppSelector(securitySelector);
  const { autoLockSeconds, lockEnabled, hasPin } = security;

  const secondsIdleRef = useRef(0);
  const autoLockRef = useRef(autoLockSeconds);
  autoLockRef.current = autoLockSeconds;

  const activeRef = useRef(lockEnabled && hasPin);
  activeRef.current = lockEnabled && hasPin;

  useEffect(() => {
    const reset = () => {
      secondsIdleRef.current = 0;
    };
    document.addEventListener("click", reset);
    document.addEventListener("mousemove", reset);
    document.addEventListener("keydown", reset);
    document.addEventListener("touchstart", reset);

    const interval = window.setInterval(() => {
      // Not armed (no PIN) or set to "Never" -> do nothing.
      if (!activeRef.current || !autoLockRef.current || autoLockRef.current <= 0) {
        secondsIdleRef.current = 0;
        return;
      }
      secondsIdleRef.current += 1;
      if (secondsIdleRef.current >= autoLockRef.current) {
        secondsIdleRef.current = 0;
        dispatch(lockApp());
      }
    }, 1000);

    return () => {
      document.removeEventListener("click", reset);
      document.removeEventListener("mousemove", reset);
      document.removeEventListener("keydown", reset);
      document.removeEventListener("touchstart", reset);
      window.clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
