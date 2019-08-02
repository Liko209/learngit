import { RouteComponentProps } from 'react-router-dom';

type HomeProps = {};

type HomeViewProps = {
  canPost: boolean;
  indexLoaded: boolean;
  showGlobalSearch: boolean;
  canRenderDialer: boolean;
  openE911: () => void;
  needConfirmE911: () => boolean;
} & RouteComponentProps;

export { HomeProps, HomeViewProps };
