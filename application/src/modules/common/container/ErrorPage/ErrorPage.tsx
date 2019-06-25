/*
 * @Author: Aaron Huo (aaron.huo@ringcentral.com)
 * @Date: 2019-06-24 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { withTranslation } from 'react-i18next';
import { JuiEmptyPage } from 'jui/pattern/EmptyPage';
import { JuiButton } from 'jui/components/Buttons';
import { IErrorPage } from './types';
import tryAgainImage from './images/try-again.svg';

const ErrorPageComponent: IErrorPage = ({ t, onReload, height }) => (
  <JuiEmptyPage
    message={t('common.prompt.loadError')}
    image={tryAgainImage}
    height={height}
  >
    <JuiButton variant="outlined" onClick={onReload}>
      {t('common.button.tryAgain')}
    </JuiButton>
  </JuiEmptyPage>
);

const ErrorPage = withTranslation('translations')(ErrorPageComponent);

export { ErrorPage };
