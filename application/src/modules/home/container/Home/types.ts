import { RouteComponentProps } from 'react-router-dom';

type HomeProps = {};

type HomeViewProps = {
  canPost: boolean;
  indexLoaded: boolean;
  showGlobalSearch: boolean;
  canRenderDialer: boolean;
  openE911: () => void;
  needConfirmE911: () => boolean;
  shouldShowE911: () => boolean;
  markE911: () => void;
} & RouteComponentProps;

export { HomeProps, HomeViewProps };
