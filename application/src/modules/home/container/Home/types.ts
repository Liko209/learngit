import { TranslationFunction } from 'i18next';
import { RouteComponentProps } from 'react-router-dom';

type HomeProps = {};

type HomeViewProps = {
  canPost: boolean;
  indexLoaded: boolean;
  t: TranslationFunction;
} & RouteComponentProps;

export { HomeProps, HomeViewProps };
