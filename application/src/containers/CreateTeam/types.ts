/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-09-30 10:49:07
 * Copyright © RingCentral. All rights reserved.
 */
import { RouteComponentProps } from 'react-router-dom';
import { TranslationFunction, i18n } from 'i18next';

type ViewProps = {
  // homePresenter: HomePresenter;
  create: Function;
  i18n: i18n;
  t: TranslationFunction;
} & RouteComponentProps;

export { ViewProps };
