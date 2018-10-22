import { TranslationFunction } from 'i18next';

import { RouteComponentProps } from 'react-router-dom';

type HomeViewProps = {
  canPost: boolean;
  indexLoaded: boolean;
  t: TranslationFunction;
} & RouteComponentProps;

type HomeProps = {};

export { HomeProps, HomeViewProps };
