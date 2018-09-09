import React, { Component } from 'react';
import { RouteComponentProps, Switch, Route, Redirect, NavLink } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import styled from 'styled-components';
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

const Link = styled(NavLink)`
  &&{
    color: ${({ theme }) => theme.palette.grey[700]};
    text-decoration: none;
    font-size: ${({ theme }) => theme.typography.fontSize + 'px'};
  }
`;
interface IProps extends RouteComponentProps<any> {
  i18n: i18n;
  t: TranslationFunction;
}

interface IStates {
  expanded: boolean;
  title: string;
  disabled: boolean;
  isLongPress: boolean;
  backNavArray: { url: string, urlTitle: string }[];
  time: number;
  nav: string;
  forwardDisabled: boolean;
  backDisabled: boolean;
  menus: {}[];
  prevUrl: string;
  currentUrl: string;
  pressNav: boolean;
  showLeftPanel: boolean;
  showRightPanel: boolean;
  forwardNavArray: { url: string, urlTitle: string }[];
}

const UMI_Count = [0];
class Home extends Component<IProps, IStates>  {
  private homePresenter: HomePresenter;
  buttonPressTimer: any = 0;
  constructor(props: IProps) {
    super(props);
    this.state = {
      expanded: localStorage.getItem('expanded') === null ? true :
        JSON.parse(String(localStorage.getItem('expanded'))),
      title: 'Jupiter',
      time: 0,
      forwardDisabled: true,
      backDisabled: true,
      nav: '',
      prevUrl: '',
      pressNav: false,
      currentUrl: '',
      disabled: true,
      backNavArray: [],
      menus: [],
      showLeftPanel: false,
      showRightPanel: false,
      isLongPress: false,
      forwardNavArray: [],
    };
    this.homePresenter = new HomePresenter();
  }
  anchorEl = React.createRef<Element>();
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
    const { location } = this.props;
    const prevUrl = location.pathname;
    const currentUrl = nextProps.location.pathname;
    this.setState({
      prevUrl,
      currentUrl,
    });
  }
  componentDidMount() {
    this.props.history.listen((route) => {
      // get previous title
      const { title, showLeftPanel, showRightPanel, pressNav } = this.state;
      setTimeout(() => {
        const { backNavArray, prevUrl } = this.state;
        const routeObj = { urlTitle: title, url: prevUrl };
        !showLeftPanel && !showRightPanel && !pressNav && backNavArray.push(routeObj);
        if (backNavArray.length > 10) {
          backNavArray.shift();
        }
        if (backNavArray.length) {
          this.setState({
            backDisabled: false,
          });
        }
      });
    });
  }
  handleForward = () => {
    const { forwardNavArray, backNavArray, isLongPress, forwardDisabled } = this.state;
    if (!isLongPress && !forwardDisabled) {
      const REMOVEITEM = forwardNavArray.shift(); // out stack
      REMOVEITEM && backNavArray.push(REMOVEITEM);
      window.history.forward();
      this.setState({
        backNavArray,
        forwardNavArray,
        pressNav: true,
        backDisabled: false,
      },            () => {
        if (!forwardNavArray.length) {
          this.setState({
            forwardDisabled: true,
          });
        }
      });
    } else {
      this.setState({
        isLongPress: false,
      });
    }
  }
  handleBackWard = () => {
    const { isLongPress, backNavArray, backDisabled, forwardNavArray } = this.state;
    if (!isLongPress && !backDisabled) {
      const REMOVEITEM = backNavArray.shift(); // out stack
      REMOVEITEM && forwardNavArray.push(REMOVEITEM);
      window.history.back();
      this.setState({
        forwardNavArray,
        backNavArray,
        pressNav: true,
        forwardDisabled: false,
      },            () => {
        if (!backNavArray.length) {
          this.setState({
            backDisabled: true,
          });
        }
      });
    } else {
      this.setState({
        isLongPress: false,
      });
    }
  }
  handleButtonPress = () => {
    const timer = 300;
    this.buttonPressTimer = setTimeout(() => this.setState({
      time: timer,
    }),                                timer);
  }
  handleButtonRelease = (evt: React.TouchEvent|React.MouseEvent, nav: string) => {
    // click will trigger also
    clearTimeout(this.buttonPressTimer);
    const { time, backNavArray, forwardNavArray } = this.state;
    if (time > 200) {
      this.setState({
        nav,
        time: 0,
        isLongPress: true,
      });
      if (nav === 'backward') {
        this.setState({
          showLeftPanel: true,
        },            () => {
          this.handleMenuItem(backNavArray.reverse());
        });
      }else {
        this.setState({
          showRightPanel: true,
        },            () => {
          this.handleMenuItem(forwardNavArray.reverse());
        });
      }
    } else {
      this.setState({
        showRightPanel: false,
        showLeftPanel: false,
        isLongPress: false,
      });
    }
  }
  handleMenuItem = (navArray: {url: string, urlTitle: string}[]) => {
    const menus = navArray && navArray.map((item, idx) => {
      return <Link key={idx} to={item!.url}>{item!.urlTitle}</Link>;
    });
    this.setState({
      menus,
    });
  }
  handleNavClose = (event: React.ChangeEvent|React.TouchEvent|React.MouseEvent<HTMLElement>, index: number|undefined) => {
    const { nav, title, currentUrl } = this.state;
    // current title
    const currentItem = { urlTitle: title, url: currentUrl };
    let { backNavArray, forwardNavArray } = this.state;
    // const { forwardNavArray } = this.state;
    if (nav === 'backward' && index !== undefined) {
      const toForward = backNavArray.splice(0, index + 1); // delete current and before
      toForward.splice(toForward.length - 1, 1); // delete click items
      forwardNavArray = forwardNavArray.concat(toForward).concat(currentItem);
      this.handleMenuItem(forwardNavArray.reverse());
      this.setState({
        backNavArray,
        forwardNavArray,
        showLeftPanel: false,
      },            () => {
        if (!backNavArray.length) {
          this.setState({
            backDisabled: true,
          });
        }
        if (forwardNavArray.length) {
          this.setState({
            forwardDisabled: false,
          });
        }
      });
    } else if (nav === 'forward' && index !== undefined) {
      const toBack = forwardNavArray.splice(0, index + 1);
      toBack.splice(toBack.length - 1, 1);
      backNavArray = backNavArray.concat(toBack).concat(currentItem);
      this.handleMenuItem(backNavArray.reverse());
      this.setState({
        backNavArray,
        forwardNavArray,
        showRightPanel: false,
      },            () => {
        if (!forwardNavArray.length) {
          this.setState({
            forwardDisabled: true,
          });
        }
        if (backNavArray.length) {
          this.setState({
            backDisabled: false,
          });
        }
      });
    }
    this.setState({
      showRightPanel: false,
      showLeftPanel: false,
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
        { icon: 'Contacts', title: 'Contacts' },
        { icon: 'Calendar', title: 'Calendar' },
        { icon: 'Tasks', title: 'Tasks' },
        { icon: 'Notes', title: 'Notes' },
        { icon: 'Files', title: 'Files' },
        { icon: 'Settings', title: 'Settings' },
      ],
    ];
  }
  handleTitle  = (title: string) => {
    console.log(title);
    this.setState({
      title,
    });
  }
  handleRouterChange = () => {
    this.setState({
      pressNav: false,
    });
  }
  render() {
    const { expanded, title, showLeftPanel, showRightPanel, menus, forwardDisabled, backDisabled } = this.state;
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
