import { useRef, useEffect } from 'react';

const useMountState = () => {
  const isMountedRef = useRef(false);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  },        []);
  return isMountedRef;
};

export { useMountState };
