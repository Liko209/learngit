import { RouteComponentProps } from 'react-router-dom';

type HomeProps = {};

type HomeViewProps = {
  canPost: boolean;
  indexLoaded: boolean;
  showGlobalSearch: boolean;
  canRenderDialer: boolean;
} & RouteComponentProps;

export { HomeProps, HomeViewProps };
