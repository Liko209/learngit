/*
 * @Author: Lex Huang (lex.huang@ringcentral.com)
 * @Date: 2019-04-22 13:36:24
 * Copyright © RingCentral. All rights reserved.
 */

import * as React from 'react';
import { ViewProps } from './types';
import { JuiFabButton } from 'jui/components/Buttons';
import styled from 'jui/foundation/styled-components';
import { spacing } from 'jui/foundation/utils';

type DialpadProps = ViewProps;

class Dialpad extends React.Component<DialpadProps> {
  constructor(props: DialpadProps) {
    super(props);
  }

  render() {
    return (
      <div {...this.props}>
        <JuiFabButton size="medium" iconName="keypad" disableRipple={true} />
      </div>
    );
  }
}

const DialpadView = styled(Dialpad)`
  margin-right: ${spacing(5)};
`;

export { DialpadView };
