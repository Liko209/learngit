/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2018-11-08 16:35:56
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ConversationCard } from '@/containers/ConversationCard';
import { JuiStream } from 'jui/pattern/ConversationPage';
import { StreamViewProps } from './types';
import { observer } from 'mobx-react';

type Props = WithTranslation & StreamViewProps;
@observer
class StreamViewComponent extends Component<Props> {
  listRef: React.RefObject<HTMLElement> = React.createRef();
  render() {
    const { ids } = this.props;
    return (
      <JuiStream>
        <section ref={this.listRef}>
          {ids.map(id => (
            <ConversationCard id={id} key={id} mode="navigation" />
          ))}
        </section>
      </JuiStream>
    );
  }
}

const StreamView = withTranslation('translations')(StreamViewComponent);

export { StreamView };
