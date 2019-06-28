/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-06-24 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import { ReactElement } from 'react';
import { WithTranslation } from 'react-i18next';

interface IErrorPageProps {
  height?: string | number;
  onReload(): void;
}

type ErrorPageProps = IErrorPageProps & WithTranslation;

interface IErrorPage {
  (props: ErrorPageProps): ReactElement;
}

export { IErrorPage, ErrorPageProps };
