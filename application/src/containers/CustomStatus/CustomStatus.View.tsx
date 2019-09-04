/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2019-08-15 10:13:01
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { observer } from 'mobx-react';
import { JuiModal } from 'jui/components/Dialog';
import { DialogContext, withEscTracking } from '@/containers/Dialog';
import { Emoji } from '@/modules/emoji';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Loading } from 'jui/hoc/withLoading';
import { ViewProps } from './types';
import { menuItemsConfig } from './config';
import { JuiCustomStatus } from 'jui/pattern/CustomStatus';

const Modal = withEscTracking(JuiModal);
const sheetSize = 64;
const set = 'emojione';
type Props = ViewProps & WithTranslation;

@observer
class CustomStatusComponent extends React.Component<
  Props,
  {
    isShowMenuList: boolean;
  }
> {
  state = {
    isShowMenuList: true,
  };
  static contextType = DialogContext;
  get menuItems() {
    const { t } = this.props;
    return menuItemsConfig.map(item => {
      return {
        emoji: item.emoji,
        status: t(item.status),
      };
    });
  }
  private _focusEl: HTMLElement | null;

  componentDidMount() {
    setTimeout(() => {
      this._focusEl = document.activeElement as HTMLElement;
    }, 0);
  }

  insertEmoji = (emoji: any, cb: Function) => {
    const { native } = emoji;
    const { handleEmojiChange } = this.props;
    handleEmojiChange(native);
    this._focusEl && this._focusEl.focus();
    cb && cb();
  };

  private _getEmojiNode = () => {
    const { t, showCloseBtn, emoji } = this.props;
    if (showCloseBtn && emoji) {
      return (
        <Emoji
          tooltip={t('message.emoji.emojiTooltip')}
          handleEmojiClick={this.insertEmoji}
          icon=""
          sheetSize={sheetSize}
          set={set}
        />
      );
    }
    return (
      <Emoji
        tooltip={t('message.emoji.emojiTooltip')}
        handleEmojiClick={this.insertEmoji}
        sheetSize={sheetSize}
        set={set}
      />
    );
  };
  private _handleStatusChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { handleInputValueChange } = this.props;
    const value = event.target.value;
    handleInputValueChange(value);
  };
  private _handleInputFocus = () => {
    this.setState({
      isShowMenuList: true,
    });
  };
  private _onStatusItemClick = (evt: React.MouseEvent, emoji: string) => {
    const { handleInputValueChange, handleEmojiChange } = this.props;
    const target = evt.target as HTMLElement;
    const value = target.innerText;
    handleInputValueChange(value);
    handleEmojiChange(emoji);
    this._focusEl && this._focusEl.focus();
    this.setState(
      {
        isShowMenuList: false,
      },
      () => {
        this._focusEl && this._focusEl.focus();
      },
    );
  };

  private _onSave = () => {
    this.props.save();
  };

  private _onClose = () => this.context();
  render() {
    const {
      t,
      inputValue,
      showCloseBtn,
      isLoading,
      emoji,
      clearStatus,
    } = this.props;
    const { isShowMenuList } = this.state;
    return (
      <Modal
        disableEscapeKeyDown={isLoading}
        open
        size="small"
        title={t('customstatus.title')}
        onCancel={this._onClose}
        onOK={this._onSave}
        modalProps={{ allowOverflowY: true, scroll: 'body' }}
        okText={t('common.dialog.save')}
        cancelText={t('common.dialog.cancel')}
      >
        <Loading loading={isLoading} alwaysComponentShow delay={0}>
          <JuiCustomStatus
            menuItems={this.menuItems}
            colons={emoji}
            value={inputValue}
            handleInputFocus={this._handleInputFocus}
            onClear={clearStatus}
            showCloseBtn={showCloseBtn}
            isShowMenuList={isShowMenuList}
            placeHolder={t('customstatus.placeHolder')}
            emojiNode={this._getEmojiNode()}
            handleStatusChange={this._handleStatusChange}
            onStatusItemClick={(evt: React.MouseEvent, emoji: string) =>
              this._onStatusItemClick(evt, emoji)
            }
          />
        </Loading>
      </Modal>
    );
  }
}
const CustomStatusView = withTranslation('translations')(CustomStatusComponent);
export { CustomStatusView };
