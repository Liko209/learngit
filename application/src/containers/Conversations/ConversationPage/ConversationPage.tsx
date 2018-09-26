import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { JuiConversationPage, JuiDivider } from 'ui-components';
import { translate } from 'react-i18next';
import { TranslationFunction } from 'i18next';
import { ConversationPageHeader } from './ConversationPageHeader';
import { ConversationStream } from './ConversationStream';
import ConversationPageViewModel from './ConversationPageViewModel';
import { MessageInput } from '@/containers/MessageInput';
import DisabledInput from 'ui-components/DisabledInput';

interface IParams {
  id: string;
}

interface IProps extends RouteComponentProps<IParams> {
  t: TranslationFunction;
}

interface IState {
  id: number;
}

@observer
class ConversationPageComponent extends Component<IProps, IState> {
  private _vm: ConversationPageViewModel = new ConversationPageViewModel();

  constructor(props: IProps) {
    super(props);
    this.state = {
      id: 0,
    };
  }

  static getDerivedStateFromProps(props: IProps) {
    const {
      match: {
        params: { id },
      },
    } = props;
    return {
      id: +id,
    };
  }

  render() {
    const { id } = this.state;
    const { t } = this.props;
    if (!id) {
      return null;
    }
    this._vm.init(id);
    return (
      <JuiConversationPage>
        <ConversationPageHeader id={id} />
        <JuiDivider />
        <ConversationStream groupId={id} key={id} />
        {this._vm.canPost ? (
          <MessageInput id={id} />
        ) : (
          <DisabledInput text={t('disabledText')} />
        )}
      </JuiConversationPage>
    );
  }
}

const ConversationPage = translate('Conversations')(
  withRouter(ConversationPageComponent),
);

export { ConversationPage };
