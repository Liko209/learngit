import React, { Component } from 'react';
import { RouteComponentProps, Switch, Route, Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';
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
import navPresenter, { NavPresenter } from './NavPresenter';

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

const UMI_Count = [0];
@observer
class Home extends Component<IProps, IStates>  {
  private homePresenter: HomePresenter;
  private _navPresenter: NavPresenter;
  constructor(props: IProps) {
    super(props);
    this.state = {
      expanded:
        localStorage.getItem('expanded') === null
          ? true
          : JSON.parse(String(localStorage.getItem('expanded'))),
    };
    this.homePresenter = new HomePresenter();
    this._navPresenter = navPresenter;
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
  componentDidMount() {
    this.props.history.listen((route) => {
      // get previous title
      this._navPresenter.handlePushRouter();
    });
  }
  handleExpand = () => {
    this.setState({
      expanded: !this.state.expanded,
    });
    localStorage.setItem('expanded', JSON.stringify(!this.state.expanded));
    const { location, history } = this.props;
    history.push({
      pathname: location.pathname,
      search: `?leftnav=${!this.state.expanded}`,
    });
  }
  handleCreateTeam = () => { };
  getIcons() {
    const { t } = this.props;
    return [
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
  }
  render() {
    const { expanded } = this.state;
    const { t } = this.props;
    const { showLeftPanel, showRightPanel } = this._navPresenter.state;
    const { forwardDisabled, backDisabled } = this._navPresenter.handleButtonState;
    const {
      menus,
      handleRouterChange,
      handleTitle,
      handleButtonRelease,
      handleButtonPress,
      handleForward,
      handleBackWard,
      handleNavClose,
    } = this._navPresenter;
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
          menuItems={menus}
          handleNavClose={handleNavClose}
          showLeftPanel={showLeftPanel}
          showRightPanel={showRightPanel}
          forwardDisabled={forwardDisabled}
          backDisabled={backDisabled}
          handleBackWard={handleBackWard}
          handleForward={handleForward}
          handleButtonPress={handleButtonPress}
          handleButtonRelease={handleButtonRelease}
        />
        <Bottom>
          <LeftNav
            expanded={expanded}
            id="leftnav"
            icons={this.getIcons()}
            umiCount={UMI_Count}
            handleRouterChange={handleRouterChange}
            handleTitle={handleTitle}
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
