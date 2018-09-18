import React, { Component } from 'react';
import { RouteComponentProps, Switch, Route, Redirect } from 'react-router-dom';
import Wrapper from './Wrapper';
import Bottom from './Bottom';
import { LeftNav, JuiIconButtonProps } from 'ui-components';
import Main from './Main';
import { translate } from 'react-i18next';
import NotFound from '@/containers/NotFound';
import Conversations from '@/containers/Conversations';
import Calls from '@/containers/Calls';
import Meetings from '@/containers/Meetings';
import Settings from '@/containers/Settings';
import HomePresenter from './HomePresenter';
import { TranslationFunction, i18n } from 'i18next';
import TopBar from 'ui-components/organisms/TopBar';
import JuiAvatarWithPresence, {
  TJuiAvatarWithPresenceProps,
} from 'ui-components/molecules/AvatarWithPresence';
import JuiIconButton from 'ui-components/molecules/IconButton';

import avatar from './avatar.jpg';
import { parse, stringify } from 'qs';
import { observer } from 'mobx-react';
import LeftNavViewModel from './LeftNav/LeftNavViewModel';

interface IProps extends RouteComponentProps<any> {
  i18n: i18n;
  t: TranslationFunction;
}

interface IStates {
  expanded: boolean;
}

const AvatarWithPresence = (props: TJuiAvatarWithPresenceProps) => {
  return <JuiAvatarWithPresence presence="online" src={avatar} {...props} />;
};

const HeaderIconButton = (props: JuiIconButtonProps) => {
  return (
    <JuiIconButton size="medium" tooltipTitle="plus" {...props}>
      add_circle
    </JuiIconButton>
  );
};

@observer
class Home extends Component<IProps, IStates> {
  private homePresenter: HomePresenter;
  private leftNavViewModel: LeftNavViewModel;

  constructor(props: IProps) {
    super(props);
    this.state = {
      expanded:
        localStorage.getItem('expanded') === null
          ? true
          : JSON.parse(String(localStorage.getItem('expanded'))),
    };
    this.homePresenter = new HomePresenter();
    this.leftNavViewModel = new LeftNavViewModel();
  }

  handleLeftNavExpand = () => {
    this.setState({ expanded: !this.state.expanded });
    localStorage.setItem('expanded', JSON.stringify(!this.state.expanded));
    const { location, history } = this.props;
    const params = parse(location.search, { ignoreQueryPrefix: true }) || {};
    params.leftnav = !this.state.expanded;
    history.replace({
      pathname: location.pathname,
      search: stringify(params, { addQueryPrefix: true }),
    });
  }

  handleSignOutClick = () => {
    const { handleSignOutClick } = this.homePresenter;
    handleSignOutClick().then(() => {
      window.location.href = '/';
    });
  }

  handleCreateTeam = () => {};

  render() {
    document.title = this.homePresenter.title;
    const { t } = this.props;
    const UMI_Count = [
      [0, this.leftNavViewModel.messageUmi, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ];

    const Icons = [
      [
        { icon: 'Dashboard', title: t('Dashboard') },
        { icon: 'Messages', title: t('Messages') },
        { icon: 'Phone', title: t('Phone') },
        { icon: 'Meetings', title: t('Meetings') },
      ],
      [
        { icon: 'Contacts', title: t('Contacts') },
        { icon: 'Calendar', title: t('Calendar') },
        { icon: 'Tasks', title: t('Tasks') },
        { icon: 'Notes', title: t('Notes') },
        { icon: 'Files', title: t('Files') },
        { icon: 'Settings', title: t('Settings') },
      ],
    ];
    const { expanded } = this.state;
    return (
      <Wrapper>
        <TopBar
          AvatarWithPresence={AvatarWithPresence}
          avatarMenuItems={[
            {
              label: t('SignOut'),
              onClick: this.handleSignOutClick,
            },
          ]}
          HeaderIconButton={HeaderIconButton}
          headerMenuItems={[
            {
              label: t('CreateTeam'),
              onClick: this.handleCreateTeam,
            },
          ]}
          onLeftNavExpand={this.handleLeftNavExpand}
          headerLogo="RingCentral"
        />
        <Bottom>
          <LeftNav
            expanded={expanded}
            id="leftnav"
            icons={Icons}
            umiCount={UMI_Count}
          />
          <Main>
            <Switch>
              <Redirect exact={true} from="/" to="/messages" />
              <Route path="/messages/:id?" component={Conversations} />
              <Route path="/calls" component={Calls} />
              <Route path="/meetings" component={Meetings} />
              <Route path="/settings" component={Settings} />
              <Route component={NotFound} />
            </Switch>
          </Main>
        </Bottom>
      </Wrapper>
    );
  }
}

export default translate('translations')(Home);
