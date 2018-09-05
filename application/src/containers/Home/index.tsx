import React, { Component } from 'react';
import { RouteComponentProps, Switch, Route, Redirect } from 'react-router-dom';
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

interface IProps extends RouteComponentProps<any> {
  i18n: i18n;
  t: TranslationFunction;
}

interface IStates {
  expanded: boolean;
}
const UMI_Count = [120, 0, 16, 1, 0, 1, 99, 0, 11];
class Home extends Component<IProps, IStates>  {
  private homePresenter: HomePresenter;
  constructor(props: IProps) {
    super(props);
    this.state = {
      expanded: localStorage.getItem('expanded') === null ? true :
        JSON.parse(String(localStorage.getItem('expanded'))),
    };
    this.homePresenter = new HomePresenter();
  }

  handleLeftNavExpand = () => {
    this.setState({
      expanded: !this.state.expanded,
    });
    localStorage.setItem('expanded', JSON.stringify(!this.state.expanded));
    const { location, history } = this.props;
    history.replace({
      pathname: location.pathname,
      search: `?leftnav=${!this.state.expanded}`,
    });
  }

  handleSignOutClick = () => {
    const { handleSignOutClick } = this.homePresenter;

    handleSignOutClick().then(() => {
      window.location.href = '/';
    });
  }

  render() {
    const { t } = this.props;

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
        <TopBar avatar={avatar} presence="online" data-anchor="expandButton" onLeftNavExpand={this.handleLeftNavExpand} onSignOutClick={this.handleSignOutClick} />
        <Bottom>
          <LeftNav expanded={expanded} id="leftnav" icons={Icons} umiCount={UMI_Count} />
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
