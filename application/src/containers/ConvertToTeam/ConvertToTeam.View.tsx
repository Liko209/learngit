/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2019-03-13 09:52:08
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, createRef } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ConvertToTeamViewProps } from './types';
import { withEscTracking } from '@/containers/Dialog';
import { JuiModal } from 'jui/components/Dialog';
import portalManager from '@/common/PortalManager';
import { JuiTopText } from 'jui/pattern/ConvertToTeam';
import { JuiTextField } from 'jui/components/Forms/TextField';
// import { JuiTextarea } from 'jui/components/Forms/Textarea';
import { Loading } from 'jui/hoc/withLoading';
// import {
//   JuiListToggleButton,
//   JuiListToggleItemProps,
// } from 'jui/pattern/ListToggleButton';
import history from '@/history';
import { Notification } from '@/containers/Notification';
import {
  ToastType,
  ToastMessageAlign,
} from '@/containers/ToastWrapper/Toast/types';
import { TeamSetting } from 'sdk/module/group';

const NAME_INPUT_PROPS = {
  'data-test-automation-id': 'ConvertToTeamTeamName',
  maxLength: 200,
};
const Modal = withEscTracking(JuiModal);

// const DESCRIPTION_INPUT_PROPS = {
//   'data-test-automation-id': 'ConvertToTeamTeamDescription',
//   maxLength: 1000,
// };

// Please do not delete the commented code.
// Now convert to team does not support permission settings.
// They may support it later.

// type Setting = {
//   isPublic: boolean;
//   canAddMember: boolean;
//   canPost: boolean;
//   canPin: boolean;
// };

type State = {
  // items: JuiListToggleItemProps[];
};

type Props = ConvertToTeamViewProps & WithTranslation;

@observer
class ConvertToTeam extends Component<Props, State> {
  teamNameRef = createRef<HTMLInputElement>();
  focusTimer: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    // this.state = {
    //   items: [],
    // };
  }

  // static get initItems() {
  //   return [
  //     {
  //       type: 'isPublic',
  //       text: t('people.team.SetAsPublicTeam'),
  //       checked: false,
  //       automationId: 'ConvertToTeamIsPublic',
  //     },
  //     {
  //       type: 'canAddMember',
  //       text: t('people.team.MembersMayAddOtherMembers'),
  //       checked: true,
  //       automationId: 'ConvertToTeamCanAddMember',
  //     },
  //     {
  //       type: 'canPost',
  //       text: t('people.team.MembersMayPostMessages'),
  //       checked: true,
  //       automationId: 'ConvertToTeamCanPost',
  //     },
  //     {
  //       type: 'canPin',
  //       text: t('people.team.MembersMayPinPosts'),
  //       checked: true,
  //       automationId: 'ConvertToTeamCanPinPost',
  //     },
  //   ];
  // }

  // static getDerivedStateFromProps(props: any, state: any) {
  //   let items = ConvertToTeamView.initItems;
  //   if (state.items.length) {
  //     items = state.items;
  //   }
  //   return {
  //     items,
  //   };
  // }

  componentDidMount() {
    // because of modal is dynamic append body
    // so must be delay focus
    this.focusTimer = setTimeout(() => {
      const node = this.teamNameRef.current;
      if (node) {
        node.select();
      }
    }, 300);
  }

  componentWillUnmount() {
    clearTimeout(this.focusTimer);
  }

  private _handleClose = () => {
    portalManager.dismissLast();
  };

  private _handleOk = async () => {
    // const { items } = this.state;
    const { name, description, save } = this.props;
    // const uiSetting = items.reduce((options, option) => {
    //   options[option.type] = option.checked;
    //   return options;
    // },                             {}) as Setting;
    const teamSetting: TeamSetting = {
      name: name.trim(),
      description: description.trim(),
      // isPublic: uiSetting.isPublic,
      // permissionFlags: {
      //   TEAM_ADD_MEMBER: uiSetting.canAddMember,
      //   TEAM_POST: uiSetting.canPost,
      //   TEAM_PIN_POST: uiSetting.canPin,
      // },
    };
    try {
      const team = await save(teamSetting);
      if (team) {
        this._handleClose();
        history.push(`/messages/${team.id}`);
      }
    } catch (e) {
      const message = 'people.prompt.FailedToConvertThisConversationToTeam';
      Notification.flashToast({
        message,
        type: ToastType.ERROR,
        messageAlign: ToastMessageAlign.LEFT,
        fullWidth: false,
        dismissible: false,
      });
    }
  };

  // private _handleSwitchChange = (
  //   item: JuiListToggleItemProps,
  //   checked: boolean,
  // ) => {
  //   const newItems = this.state.items.map((oldItem: JuiListToggleItemProps) => {
  //     if (oldItem.text === item.text) {
  //       return {
  //         ...oldItem,
  //         checked,
  //       };
  //     }
  //     if (oldItem.type === 'canPin' && item.type === 'canPost') {
  //       return {
  //         ...oldItem,
  //         checked,
  //         disabled: !checked,
  //       };
  //     }
  //     return oldItem;
  //   });
  //   this.setState({
  //     items: newItems,
  //   });
  // }

  render() {
    // const { items } = this.state;
    const {
      t,
      name,
      nameErrorKey,
      handleNameChange,
      // handleDescriptionChange,
      saving,
      disabledOkBtn,
    } = this.props;
    return (
      <Modal
        disableEscapeKeyDown={saving}
        open
        size="medium"
        title={t('people.team.convertToTeam')}
        onCancel={this._handleClose}
        onOK={this._handleOk}
        okText={t('people.team.convertToTeam')}
        cancelText={t('common.dialog.cancel')}
        okBtnProps={{
          disabled: disabledOkBtn,
          'data-test-automation-id': 'convertToTeamOkButton',
        }}
        cancelBtnProps={{
          'data-test-automation-id': 'convertToTeamCancelButton',
        }}
      >
        <Loading loading={saving} alwaysComponentShow delay={0}>
          <JuiTopText>
            {t('people.team.convertToTeamPreviousMessageHandle')}
          </JuiTopText>
          <JuiTextField
            value={name}
            id={t('people.team.teamName')}
            label={t('people.team.teamName')}
            fullWidth
            error={!!nameErrorKey}
            inputProps={NAME_INPUT_PROPS}
            inputRef={this.teamNameRef}
            helperText={nameErrorKey && t(nameErrorKey)}
            onChange={handleNameChange}
          />
          {/* <JuiTextarea
            id={t('people.team.teamDescription')}
            label={t('people.team.teamDescription')}
            inputProps={DESCRIPTION_INPUT_PROPS}
            fullWidth={true}
            onChange={handleDescriptionChange}
          /> */}
          {/* <JuiListToggleButton
            data-test-automation-id="ConvertToTeamToggleList"
            items={items}
            onChange={this._handleSwitchChange}
          /> */}
        </Loading>
      </Modal>
    );
  }
}

const ConvertToTeamView = withTranslation('translations')(ConvertToTeam);

export { ConvertToTeamView };
