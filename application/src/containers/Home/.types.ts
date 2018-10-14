import { TranslationFunction } from 'i18next';

import { RouteComponentProps } from 'react-router-dom';

type HomeViewProps = {
  canPost: boolean;
  validateGroupId: (id: number) => boolean;
  t: TranslationFunction;
  lastGroupId?: number;
} & RouteComponentProps;

type HomeProps = {
  validateGroupId: (id: number) => boolean;
};

export { HomeProps, HomeViewProps };
