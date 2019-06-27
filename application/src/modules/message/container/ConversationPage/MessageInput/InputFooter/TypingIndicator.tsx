/*
 * @Author: Alessia Li (alessia.li@ringcentral.com)
 * @Date: 2019-06-26 11:04:09
 * Copyright © RingCentral. All rights reserved.
 */

import React, { ReactNode } from 'react';
import { Trans } from 'react-i18next';
import { JuiInputFooterItem } from 'jui/pattern/MessageInput/InputFooter';
import { observer } from 'mobx-react';

type TypingIndicatorProps = {
  show: boolean;
  typingList: string[];
};

@observer
class TypingIndicator extends React.Component<TypingIndicatorProps> {
  constructor(props: TypingIndicatorProps) {
    super(props);
  }
  getTranslations = (typingList: string[]) => {
    const len: number = typingList.length;
    switch (len) {
      case 1:
        return {
          key: 'oneTyping',
          values: { personA: typingList[0] },
        };
      case 2:
        return {
          key: 'twoTyping',
          values: {
            personA: typingList[0],
            personB: typingList[1],
          },
        };
      default:
        return {
          key: 'moreTyping',
          values: {
            personA: typingList[0],
            personB: typingList[1],
          },
        };
    }
  }
  render() {
    const { show, typingList } = this.props;
    let content: ReactNode | string = '';
    if (typingList.length) {
      const { key, values } = this.getTranslations(typingList);
      content = (
        <Trans
          i18nKey={`message.typingIndicator.${key}`}
          values={values}
          components={[<strong key="0" />]}
        />
      );
    }

    return (
      <JuiInputFooterItem
        show={show}
        align={'left'}
        content={content}
        data-test-automation-id="typingIndicator"
      />
    );
  }
}

export { TypingIndicator };
