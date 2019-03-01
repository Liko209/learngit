import { ExitHandler, EnterHandler } from 'react-transition-group/Transition';
export type AnimationOptions = {
  duration: string;
  easing: string;
};

export type TransitionAnimationProps = {
  children: React.ReactNode;
  show: boolean;
  duration: string;
  easing: string;
  onExited?: ExitHandler;
  onEntered?: EnterHandler;
};
