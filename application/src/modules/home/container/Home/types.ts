import { RouteComponentProps } from 'react-router-dom';

type HomeProps = {};

type HomeViewProps = {
  canPost: boolean;
  indexLoaded: boolean;
} & RouteComponentProps;

export { HomeProps, HomeViewProps };
