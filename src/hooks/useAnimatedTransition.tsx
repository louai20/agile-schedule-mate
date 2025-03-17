
import { useState, useCallback } from 'react';

type TransitionState = 'entering' | 'entered' | 'exiting' | 'exited';

interface UseAnimatedTransitionProps {
  initialState?: TransitionState;
  onExited?: () => void;
  enterDuration?: number;
  exitDuration?: number;
}

const useAnimatedTransition = ({
  initialState = 'entered',
  onExited,
  enterDuration = 300,
  exitDuration = 300
}: UseAnimatedTransitionProps = {}) => {
  const [state, setState] = useState<TransitionState>(initialState);

  const enter = useCallback(() => {
    setState('entering');
    const timeout = setTimeout(() => {
      setState('entered');
    }, enterDuration);
    return () => clearTimeout(timeout);
  }, [enterDuration]);

  const exit = useCallback(() => {
    setState('exiting');
    const timeout = setTimeout(() => {
      setState('exited');
      onExited?.();
    }, exitDuration);
    return () => clearTimeout(timeout);
  }, [exitDuration, onExited]);

  return {
    state,
    enter,
    exit,
    isEntering: state === 'entering',
    isEntered: state === 'entered',
    isExiting: state === 'exiting',
    isExited: state === 'exited',
    isVisible: state === 'entering' || state === 'entered',
  };
};

export default useAnimatedTransition;
