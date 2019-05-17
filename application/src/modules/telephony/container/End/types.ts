/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-11-07 17:56:52
 * Copyright © RingCentral. All rights reserved.
 */
import { JuiFabProps } from 'jui/components/Buttons';

type EndProps = {
  size?: JuiFabProps['size'];
};

type EndViewProps = {
  end: () => void;
} & EndProps;

export { EndProps, EndViewProps };
