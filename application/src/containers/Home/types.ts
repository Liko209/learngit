import { TranslationFunction } from 'i18next';

import { RouteComponentProps } from 'react-router-dom';

type HomeViewProps = {
  canPost: boolean;
  indexLoaded: boolean;
  t: TranslationFunction;
  isOpen: boolean;
} & RouteComponentProps;

type HomeProps = {};

export { HomeProps, HomeViewProps };
