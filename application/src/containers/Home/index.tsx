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
import { TranslationFunction, i18n } from 'i18next';
import TopBar from 'ui-components/organisms/TopBar';
import avatar from './avatar.jpg';
import { service } from 'sdk';

const { AuthService } = service;

interface IProps extends RouteComponentProps<any> {
  i18n: i18n;
  t: TranslationFunction;
}

interface IStates {
  isExpand: boolean;
}
const UMI_Count = [120, 0, 16, 1, 0, 1, 99, 0, 11];
class Home extends Component<IProps, IStates>  {
  constructor(props: IProps) {
    super(props);
    this.state = {
      isExpand: localStorage.getItem('isExpand') === null ? true :
        JSON.parse(String(localStorage.getItem('isExpand'))),
    };
    this.signOutClickHandler = this.signOutClickHandler.bind(this);
  }

  async signOutClickHandler() {
    const authService: service.AuthService = AuthService.getInstance();
    await authService.logout();
    window.location.href = '/';
  }
  handleExpand = () => {
    this.setState({
      isExpand: !this.state.isExpand,
    });
    localStorage.setItem('isExpand', JSON.stringify(!this.state.isExpand));
    const { location, history } = this.props;
    history.push({
      pathname: location.pathname,
      search: `?leftnav=${!this.state.isExpand}`,
    });
  }
  render() {
    // const { match } = this.props;
    const { t } = this.props;

    const Icons = [
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
    const { isExpand } = this.state;
    return (
      <Wrapper>
        <TopBar handleLeftNavExpand={this.handleExpand} avatar={avatar} presence="online" data-anchor="expandButton" handleSignOutClick={this.signOutClickHandler} />
        <Bottom>
          <LeftNav isExpand={isExpand} id="leftnav" icons={Icons} umiCount={UMI_Count} />
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
      </Wrapper>);
  }
}

export default translate('translations')(Home);
