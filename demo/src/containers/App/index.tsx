import * as React from 'react';
import { observer } from 'mobx-react';
import { Helmet } from 'react-helmet';
import styled from 'styled-components';
import {
  Switch,
  Route,
  withRouter,
  RouteComponentProps,
} from 'react-router-dom';
import { hot } from 'react-hot-loader';
import AuthRoute from '@/components/AuthRoute';
import Login from '@/containers/Login';
import UnifiedLogin from '@/containers/UnifiedLogin';
import Home from '@/containers/Home';
import Status from '@/containers/Status';
import NoteWrapper from '@/containers/Editor/wrapper';
import SingleConversation from '@/containers/singleConversation';
import ThemeProvider from '@/styled';

import AppPresenter from './AppPresenter';

const AppWrapper = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
`;

interface Props extends RouteComponentProps<any> {}
interface States {
  mode: string;
}

@observer
class App extends React.Component<Props, States> {
  presenter: AppPresenter;
  constructor(props: Props) {
    super(props);
    this.state = {
      mode: 'ordinary',
    };
    this.presenter = new AppPresenter(this.props.history);
  }

  componentWillUnmount() {
    this.presenter.dispose();
  }
  render() {
    const { mode } = this.state;
    return (
      <ThemeProvider theme={{ mode }}>
        <AppWrapper>
          <Helmet>
            <title>Fiji</title>
            <meta
                name="description"
                content="Glip is fully searchable, real-time group chat & video chat, task management, file sharing and more, in one easy-to-use app. Get started FREE today."
            />
          </Helmet>
          <Switch>
            <Route path="/unified-login" component={UnifiedLogin} />
            <Route path="/login" component={Login} />
            <Route path="/commit-info" component={Status} />
            <AuthRoute path="/note/:id" component={NoteWrapper} />
            <AuthRoute path="/singleConversation/:id?" component={SingleConversation} />
            <AuthRoute path="/" component={Home} />
          </Switch>
        </AppWrapper>
      </ThemeProvider>
    );
  }
}

export default withRouter(hot(module)(App));
