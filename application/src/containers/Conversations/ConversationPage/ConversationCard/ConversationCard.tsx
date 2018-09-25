import React from 'react';
import { ENTITY_NAME } from '@/store';
import { observer } from 'mobx-react';
import { JuiDivider } from 'ui-components/atoms/Divider';
import { JuiButtonBar } from 'ui-components/molecules/ButtonBar';
import { JuiIconButton } from 'ui-components/molecules/IconButton';
import { POST_STATUS } from 'sdk/service';
import injectStore, { IInjectedStoreProps } from '@/store/inject';
import VM from '@/store/ViewModel';
import PostModel from '@/store/models/Post';
import {
  JuiConversationCard,
  JuiConversationCardHeader,
  JuiConversationCardFooter,
} from 'ui-components/organisms/ConversationCard';
import moment from 'moment';
import { Post, Person } from 'sdk/src/models';
import PersonModel from '@/store/models/Person';
import { getEntity } from '@/store/utils';
import { Avatar } from '../../../Avatar/Avatar';
import ViewModel from './ViewModel';
import Comfirm from 'ui-components/molecules/Dialog/Comfirm';
import { TranslationFunction } from 'i18next';
import { translate } from 'react-i18next';

interface IProps extends IInjectedStoreProps<VM> {
  id: number;
  t: TranslationFunction;
}

interface IStates {
  open: boolean;
}

@observer
export class ConversationCard extends React.Component<IProps, IStates> {
  private _vm: ViewModel;

  constructor(props: IProps) {
    super(props);
    this.state = { open: false };
    this._vm = new ViewModel(props.id);
  }

  resend = () => {
    this._vm.resend();
  }

  delete = () => {
    this.setState({ open: true });
  }

  onOkDelete = () => {
    this._vm.delete();
    this.onCloseDelete();
  }

  onCloseDelete = () => {
    this.setState({ open: false });
  }

  render() {
    const { id, t } = this.props;
    const { open } = this.state;
    const post = getEntity<Post, PostModel>(ENTITY_NAME.POST, id);
    const creator = getEntity<Person, PersonModel>(ENTITY_NAME.PERSON, post.creatorId);
    const { text, createdAt, status = POST_STATUS.SUCCESS } = post;
    const avatar = (<Avatar uId={id} size="medium">SH</Avatar>);
    return (
      <React.Fragment>
        <JuiConversationCard Avatar={avatar}>
          <JuiConversationCardHeader
            name={creator.displayName}
            time={moment(createdAt).format('hh:mm A')}
          >
            <JuiButtonBar size="small">
              {
                status === POST_STATUS.INPROGRESS &&
                <JuiIconButton variant="plain" tooltipTitle={t('sendingPost')} color="secondary">autorenew</JuiIconButton>
              }
              {
                status === POST_STATUS.FAIL &&
                <JuiIconButton variant="plain" tooltipTitle={t('resendPost')} color="secondary" onClick={this.resend}>refresh</JuiIconButton>
              }
              {
                status === POST_STATUS.FAIL &&
                <JuiIconButton variant="plain" tooltipTitle={t('deletePost')} onClick={this.delete}>delete</JuiIconButton>
              }
            </JuiButtonBar>
          </JuiConversationCardHeader>
          {/* todo: content */}
          <div
            style={{ fontSize: '14px', lineHeight: '24px', color: '#616161' }}
          >
            {text}
          </div>
          {/* todo: content */}
          <JuiConversationCardFooter>
            {/* todo: footer */}
          </JuiConversationCardFooter>
        </JuiConversationCard>
        <JuiDivider />
        <Comfirm
          open={open}
          size="medium"
          header={t('deletePostTitle')}
          okText={t('deletePostOk')}
          closeText={t('deletePostCancel')}
          onOk={this.onOkDelete}
          onClose={this.onCloseDelete}
        >
          {t('deletePostContent')}
        </Comfirm>
      </React.Fragment>
    );
  }
}

/* this should be removed once conversation card developed*/
export default translate('Conversations')(injectStore(VM)(ConversationCard));
