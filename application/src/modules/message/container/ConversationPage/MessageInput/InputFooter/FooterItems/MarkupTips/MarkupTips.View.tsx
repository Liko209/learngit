/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-06-24 10:55:00
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { withTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import { MarkupTipsViewProps, MarkupTipsViewState } from './types';
import { JuiInputFooterItem } from 'jui/pattern/MessageInput/InputFooter';

@observer
class MarkupTipsViewComponent extends React.Component<
  MarkupTipsViewProps,
  MarkupTipsViewState
> {
  constructor(props: MarkupTipsViewProps) {
    super(props);
    this.state = {
      exited: !props.show,
    };
  }
  onExited = () => {
    this.setState({
      exited: true,
    });
  }
  componentDidUpdate({ show }: MarkupTipsViewProps) {
    if (!show && this.props.show) {
      this.setState({
        exited: false,
      });
    }
  }
  render() {
    const { t, show } = this.props;
    const { exited } = this.state;
    const content = t('message.markupTips');
    return (
      (show || !exited) && (
        <JuiInputFooterItem
          show={show}
          align={'right'}
          content={content}
          onExited={this.onExited}
          data-test-automation-id="markup-tips"
        />
      )
    );
  }
}

const MarkupTipsView = withTranslation()(MarkupTipsViewComponent);
export { MarkupTipsView };
