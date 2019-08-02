/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2019-07-25 10:00:13
 * Copyright © RingCentral. All rights reserved.
 */
import { WithTranslation } from 'react-i18next';
import { JuiModalProps } from 'jui/components/Dialog';

type Props = {};

type ViewProps = {
  isShow: boolean;
  switchCall: () => Promise<void>;
  openCallSwitch: (data: JuiModalProps) => void;
  displayName: string;
  reset: () => void;
} & WithTranslation;

export { Props, ViewProps };
