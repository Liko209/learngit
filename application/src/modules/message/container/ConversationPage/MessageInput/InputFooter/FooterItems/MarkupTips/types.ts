/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-06-24 12:55:36
 * Copyright © RingCentral. All rights reserved.
 */

import { WithTranslation } from 'react-i18next';

type MarkupTipsProps = {
  show: boolean;
};

type MarkupTipsViewProps = WithTranslation & MarkupTipsProps;

type MarkupTipsViewState = {
  exited: boolean;
};
export { MarkupTipsProps, MarkupTipsViewProps, MarkupTipsViewState };
