/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-12-08 21:00:36
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { EditMessageInputViewProps } from './types';
import { JuiMessageInput } from 'jui/pattern/MessageInput';
import { extractView } from 'jui/hoc/extractView';
import { Mention } from '@/modules/message/container/ConversationPage/MessageInput/Mention';
import keyboardEventDefaultHandler from 'jui/pattern/MessageInput/keyboardEventDefaultHandler';
import { observer } from 'mobx-react';
import { handleAtMention } from 'jui/pattern/MessageInput/Mention/handleAtMention';
import { IMessageService } from '@/modules/message/interface';
import { reaction, IReactionDisposer } from 'mobx';
import { getScrollParent } from '../../ConversationPage/Stream/helper';

type State = {
  modules: object;
};
type Props = EditMessageInputViewProps & WithTranslation;
@observer
class EditMessageInputViewComponent extends Component<Props, State> {
  @IMessageService private _messageService: IMessageService;
  private _ref: React.RefObject<HTMLDivElement> = React.createRef();
  private _messageInputRef: React.RefObject<
    JuiMessageInput
  > = React.createRef();
  private _mentionRef: React.RefObject<any> = React.createRef();
  private _disposer: IReactionDisposer;
  state = {
    modules: {},
  };
  constructor(props: Props) {
    super(props);
    this._disposer = reaction(
      () => this._messageService.getCurrentInputFocus() === this.props.id,
      (shouldFocus: boolean) => {
        shouldFocus && this.focusEditor();
      },
    );
  }

  componentDidMount() {
    this.updateModules();
  }
  componentWillUnmount() {
    this._messageService.blurEditInputFocus();
    this._disposer();
  }

  updateModules() {
    const mention = this._mentionRef.current;
    const { keyboardEventHandler } = this.props;
    this.setState({
      modules: {
        toolbar: false,
        keyboard: {
          bindings: { ...keyboardEventHandler, ...keyboardEventDefaultHandler },
        },
        mention: mention.vm.mentionOptions,
      },
    });
  }

  focusEditor = () => {
    if (this._messageInputRef.current) {
      this.scrollEditAreaIntoView();
      this._messageInputRef.current.focusEditor();
    }
  };

  scrollEditAreaIntoView = () => {
    const target = this._ref.current;
    if (target) {
      const container = getScrollParent(target, false);
      if (container) {
        const { bottom: H1 } = target.getBoundingClientRect();
        const { bottom: H2 } = container.getBoundingClientRect();
        const delta = H1 - H2;
        const offset = 20;
        if (delta > 0) {
          container.scrollTop += delta + offset;
        }
      }
    }
  };

  blurHandler = () => {
    this._messageService.blurEditInputFocus();
  };

  render() {
    const { draft, text, error, gid, t, id, saveDraft } = this.props;
    const { modules } = this.state;
    return (
      <div ref={this._ref}>
        <JuiMessageInput
          ref={this._messageInputRef}
          defaultValue={draft || handleAtMention(text)}
          error={error ? t(error) : error}
          modules={modules}
          autofocus={false}
          isEditMode
          onChange={saveDraft}
          onBlur={this.blurHandler}
          placeholder={t('message.action.typeNewMessage')}
        >
          <Mention id={gid} pid={id} isEditMode ref={this._mentionRef} />
        </JuiMessageInput>
      </div>
    );
  }
}

const View = extractView<EditMessageInputViewProps & WithTranslation>(
  EditMessageInputViewComponent,
);
const EditMessageInputView = withTranslation('translations')(View);

export { EditMessageInputView, EditMessageInputViewComponent };
