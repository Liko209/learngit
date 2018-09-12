import React, { Component } from 'react';
import { RouteComponentProps, Switch, Route, Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';
import DocumentTitle from 'react-document-title';
import Wrapper from './Wrapper';
import Bottom from './Bottom';
import { LeftNav } from 'ui-components';
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
import avatar from './avatar.jpg';
import { parse, stringify } from 'qs';
import NavPresenter from './NavPresenter';

interface IProps extends RouteComponentProps<any> {
  i18n: i18n;
  t: TranslationFunction;
}

interface IStates {
  expanded: boolean;
}

const UMI_Count = [0];
@observer
class Home extends Component<IProps, IStates>  {
  private homePresenter: HomePresenter;
  private navPresenter: any;
  constructor(props: IProps) {
    super(props);
    this.state = {
      expanded: localStorage.getItem('expanded') === null ? true :
        JSON.parse(String(localStorage.getItem('expanded'))),
    };
    this.homePresenter = new HomePresenter();
    this.navPresenter = NavPresenter;
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
    this.props.history.listen((route) => {
      // get previous title
      const state = this.navPresenter.state;
      const { title, showLeftPanel, showRightPanel, pressNav, menuClicked } = state;
      setTimeout(() => {
        const { backNavArray } = this.navPresenter;
        if (!showLeftPanel && !showRightPanel && !pressNav && !menuClicked) {
          backNavArray.push({ title });
          this.navPresenter.backNavArray = backNavArray;
        }
        if (backNavArray.length > 10) {
          backNavArray.shift();
        }
        if (backNavArray.length) {
          this.navPresenter.state.backDisabled = false;
          this.navPresenter.setItem('backNavArray', JSON.stringify(backNavArray));
        }
      });
    });
  }
  handleForward = () => {
    this.navPresenter.handleForward();
  }
  handleBackWard = () => {
    this.navPresenter.handleBackWard();
  }
  handleButtonPress = () => {
    this.navPresenter.handleButtonPress();
  }
  handleButtonRelease = (evt: React.TouchEvent|React.MouseEvent, nav: string) => {
    // click will trigger also
    this.navPresenter.handleButtonRelease(evt, nav);
  }
  handleMenuItem = (navArray: {url: string, urlTitle: string}[]) => {
    this.navPresenter.handleMenuItem(navArray);
  }
  handleNavClose = (event: React.ChangeEvent|React.TouchEvent|React.MouseEvent<HTMLElement>, index: number|undefined) => {
    this.navPresenter.handleNavClose(event, index);
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
  getIcons() {
    const { t } = this.props;
    return [
      [
        { icon: 'Dashboard', title: t('Dashboard') },
        { icon:'Messages', title: t('Messages') },
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
  handleTitle  = (title: string) => {
    this.navPresenter.handleTitle(title);
  }
  handleRouterChange = () => {
    this.navPresenter.handleRouterChange();
  }
  render() {
    const { expanded } = this.state;
    const { title, showLeftPanel, showRightPanel, forwardDisabled, backDisabled } = this.navPresenter.state;
    const { menus } = this.navPresenter;
    return (
      <Wrapper>
        <TopBar
          avatar={avatar}
          presence="online"
          data-anchor="expandButton"
          onLeftNavExpand={this.handleLeftNavExpand}
          onSignOutClick={this.handleSignOutClick}
          showLeftPanel={showLeftPanel}
          showRightPanel={showRightPanel}
          menuItems={menus}
          forwardDisabled={forwardDisabled}
          backDisabled={backDisabled}
          handleNavClose={this.handleNavClose}
          handleBackWard={this.handleBackWard}
          handleForward={this.handleForward}
          handleButtonPress={this.handleButtonPress}
          handleButtonRelease={this.handleButtonRelease}
        />
        <Bottom>
          <DocumentTitle title={title}>
            <LeftNav
              expanded={expanded}
              id="leftnav"
              icons={this.getIcons()}
              umiCount={UMI_Count}
              handleRouterChange={this.handleRouterChange}
              handleTitle={this.handleTitle}
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
