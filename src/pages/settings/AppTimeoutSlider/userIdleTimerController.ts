import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../stores/hooks";
import {
  initialState,
  setSeedDetails,
  setBalance,
  setIdleTimer,
  setUserLogout
} from "../../../stores/features/seedDetailSlice";


interface UserIdleInWindowController {
  isUserIdle: boolean;
  EventName_userDidBecomeIdle: string;
  EventName_userDidComeBackFromIdle: string;
  disableUserIdle: () => void;
  reEnableUserIdle: () => void;
}

const userIdleTimerController = (cb?: any): UserIdleInWindowController => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const walletDetails = useSelector((state: any) => state.seedDetailReducer);
  const timer = walletDetails.timer

  // let timer=walletDetails.timer ;
  const [isUserIdle, setIsUserIdle] = useState(false);
  const numberOfSecondsSinceLastUserInteractionRef = useRef(0);
  const numberOfRequestsToLockUserIdleAsDisabledRef = useRef(0);
  const userIdleIntervalTimerRef = useRef<number | null | any>(null);
  const userIdleSetTimerRef = useRef<number | null | any>(timer);


  const EventName_userDidBecomeIdle = 'EventName_userDidBecomeIdle';
  const EventName_userDidComeBackFromIdle = 'EventName_userDidComeBackFromIdle';

  useEffect(() => {
    const userDidInteract = (): void => {
      numberOfSecondsSinceLastUserInteractionRef.current = 0;
    };

    document.onclick = userDidInteract;
    document.onmousemove = userDidInteract;
    document.onkeypress = userDidInteract;
    initiateUserIdleIntervalTimer();

    return () => {
      disableUserIdle();
    };
  }, []); // Empty dependency array means this useEffect runs once on mount

  useEffect(() => {
    userIdleSetTimerRef.current = timer

    if (numberOfRequestsToLockUserIdleAsDisabledRef.current > 0) {
      disableUserIdle();
    } else {
      reEnableUserIdle();
    }
  }, [numberOfRequestsToLockUserIdleAsDisabledRef.current, timer]);

  const disableUserIdle = (): void => {
    numberOfRequestsToLockUserIdleAsDisabledRef.current += 1;

    if (numberOfRequestsToLockUserIdleAsDisabledRef.current === 1) {
      console.log('⏳  Temporarily disabling the user idle timer.');
      if (userIdleIntervalTimerRef.current !== null) {
        clearInterval(userIdleIntervalTimerRef.current);
        userIdleIntervalTimerRef.current = null;
      }
    } else {
      console.log('⏳  Requested to temporarily disable user idle but already disabled. Incremented lock.');
    }
  };

  const reEnableUserIdle = (): void => {
    if (numberOfRequestsToLockUserIdleAsDisabledRef.current === 0) {
      return;
    }

    numberOfRequestsToLockUserIdleAsDisabledRef.current -= 1;

    if (numberOfRequestsToLockUserIdleAsDisabledRef.current === 0) {
      console.log('⏳  Re-enabling the user idle timer.');
      initiateUserIdleIntervalTimer();
    } else {
      console.log('⏳  Requested to re-enable user idle but other locks still exist.');
    }
  };

  const initiateUserIdleIntervalTimer = (): void => {
    if (userIdleIntervalTimerRef.current === null) {
      userIdleIntervalTimerRef.current = setInterval(userIdleIntervalTimerFn, 1000);
    }
  };

  const userIdleIntervalTimerFn = (): void => {
    numberOfSecondsSinceLastUserInteractionRef.current += 1;
    let appTimeoutAfterS: number = userIdleSetTimerRef.current || 120;
    if (appTimeoutAfterS === 1500) {
      return;
    }
    if (numberOfSecondsSinceLastUserInteractionRef.current >= userIdleSetTimerRef.current) {
      if (!isUserIdle) {
        userDidBecomeIdle();
      }
    }
  };
  const logout = () => {
    dispatch(setUserLogout());
    // dispatch(setBalance(0));
    // dispatch(setIdleTimer(120))
    navigate("/");
  };

  const userDidComeBackFromIdle = (): void => {
    setIsUserIdle(false);
    console.log('👀  User came back from having been idle.');
  };

  const userDidBecomeIdle = (): void => {
    setIsUserIdle(true);

    console.log('⏲  User became idle.');
    logout();
  };

  return {
    isUserIdle,
    EventName_userDidBecomeIdle,
    EventName_userDidComeBackFromIdle,
    disableUserIdle,
    reEnableUserIdle,
  };
};

export default userIdleTimerController;
