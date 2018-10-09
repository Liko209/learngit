import React from 'react';
import { observer } from 'mobx-react';
import { JuiDivider } from 'jui/components/Divider';
import { JuiButtonBar } from 'jui/components/Buttons/ButtonBar';
import { JuiIconButton } from 'jui/components/Buttons/IconButton';
import { POST_STATUS } from 'sdk/service';
import {
  JuiConversationCard,
  JuiConversationCardHeader,
  JuiConversationCardFooter,
} from 'jui/pattern/ConversationCard';
import { Avatar } from '@/containers/Avatar';
import { JuiConfirm } from 'jui/components/Dialog/Confirm';
import { TranslationFunction } from 'i18next';
import { translate } from 'react-i18next';
import { ConversationCardViewProps } from '@/containers/ConversationCard/types';

type IProps = ConversationCardViewProps & {
  t: TranslationFunction;
};

interface IStates {
  open: boolean;
}

@observer
export class ConversationCard extends React.Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
    this.state = { open: false };
  }

  resend = () => {
    this.props.resend();
  }

  delete = () => {
    this.setState({ open: true });
  }

  onOkDelete = () => {
    this.props.delete();
    this.onCloseDelete();
  }

  onCloseDelete = () => {
    this.setState({ open: false });
  }

  render() {
    const { t, post, creator, displayTitle, createTime } = this.props;
    const { open } = this.state;
    const { text, status = POST_STATUS.SUCCESS } = post;
    const avatar = <Avatar uid={creator.id} size="medium" />;
    return (
      <React.Fragment>
        <JuiConversationCard Avatar={avatar}>
          <JuiConversationCardHeader name={displayTitle} time={createTime}>
            {/* todo replace self maintenance Actions component */}
            <JuiButtonBar size="small">
              {status === POST_STATUS.INPROGRESS && (
                <JuiIconButton
                  variant="plain"
                  tooltipTitle={t('sendingPost')}
                  color="secondary"
                >
                  autorenew
                </JuiIconButton>
              )}
              {status === POST_STATUS.FAIL && (
                <JuiIconButton
                  variant="plain"
                  tooltipTitle={t('resendPost')}
                  color="secondary"
                  onClick={this.resend}
                >
                  refresh
                </JuiIconButton>
              )}
              {status === POST_STATUS.FAIL && (
                <JuiIconButton
                  variant="plain"
                  tooltipTitle={t('deletePost')}
                  onClick={this.delete}
                >
                  delete
                </JuiIconButton>
              )}
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
<<<<<<< HEAD
        <JuiConfirm
=======
        {/* todo replace js invoke */}
        <Confirm
>>>>>>> 2806e10bc47deb754d071473c84b6c05baea2147
          open={open}
          size="medium"
          header={t('deletePostTitle')}
          okText={t('deletePostOk')}
          closeText={t('deletePostCancel')}
          onOk={this.onOkDelete}
          onClose={this.onCloseDelete}
        >
          {t('deletePostContent')}
        </JuiConfirm>
      </React.Fragment>
    );
  }
}

const ConversationCardView = translate('Conversations')(ConversationCard);

export { ConversationCardView };
