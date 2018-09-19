import React, { Component } from 'react';
import { RouteComponentProps, Switch, Route, Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';
import DocumentTitle from 'react-document-title';
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
import LeftNavViewModel from './LeftNav/LeftNavViewModel';
import navPresenter, { NavPresenter } from './NavPresenter';
import { isElectron } from '@/utils';

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
  private navPresenter: NavPresenter;
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
    this.navPresenter = navPresenter;
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
      sessionStorage.removeItem('backNavArray');
      sessionStorage.removeItem('forwardNavArray');
      window.location.href = '/';
    });
  }
  componentWillReceiveProps(nextProps: IProps) {
    const state = this.navPresenter.state;
    const { forwardNavArray, backNavArray } = this.navPresenter;
    if (forwardNavArray.length) {
      state.forwardDisabled = false;
    }
    if (backNavArray.length) {
      state.backDisabled = false;
    }
  }
  componentDidMount() {
    this.props.history.listen((route: any) => {
      // get previous title
      const state = this.navPresenter.state;
      const { title, showLeftPanel, showRightPanel, pressNav } = state;
      setTimeout(() => {
        const {
          backNavArray,
          menuClicked,
          forwardNavArray,
        } = this.navPresenter;
        if (!showLeftPanel && !showRightPanel && !pressNav && !menuClicked) {
          backNavArray.push({ title });
          this.navPresenter.backNavArray = backNavArray;
        }
        this.navPresenter.menuClicked = false;
        if (backNavArray.length > 10) {
          backNavArray.shift();
        }
        if (forwardNavArray.length > 10) {
          forwardNavArray.shift();
        }
        if (backNavArray.length) {
          this.navPresenter.state.backDisabled = false;
          isElectron &&
            this.navPresenter.setItem(
              'backNavArray',
              JSON.stringify(backNavArray),
            );
        }
      });
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
  handleCreateTeam = () => {};

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
    const { t } = this.props;
    const UMI_COUNT = [
      [0, this.leftNavViewModel.messageUmi, 0, 0],
      [0, 0, 0, 0, 0, 0],
    ];
    const { expanded } = this.state;
    const {
      forwardDisabled,
      showLeftPanel,
      showRightPanel,
      backDisabled,
    } = this.navPresenter.state;
    const title = this.navPresenter.title;
    const {
      menus,
      handleRouterChange,
      handleTitle,
      handleButtonRelease,
      handleButtonPress,
      handleForward,
      handleBackWard,
      handleNavClose,
    } = this.navPresenter;
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
          <DocumentTitle title={title}>
            <LeftNav
              expanded={expanded}
              id="leftnav"
              icons={this.getIcons()}
              umiCount={UMI_COUNT}
              handleRouterChange={handleRouterChange}
              handleTitle={handleTitle}
            />
          </DocumentTitle>
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
