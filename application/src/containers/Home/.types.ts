import { TranslationFunction } from 'i18next';

import { RouteComponentProps } from 'react-router-dom';

type HomeViewProps = {
  canPost: boolean;
  invalidUser: boolean;
  t: TranslationFunction;
} & RouteComponentProps;

type HomeProps = {
  invalidUser: boolean;
};

export { HomeProps, HomeViewProps };
