import React, { PureComponent } from 'react';
import ReactContentLoader from 'react-content-loader';
import Grid from '@material-ui/core/Grid';
import { withTheme } from 'styled-components';
import { ThemeProps } from '../../styled-components';

class ContentLoader extends PureComponent<ThemeProps> {
  static dependencies: React.ComponentType[];

  render() {
    const { theme: { palette: { grey } } } = this.props;
    return (
      <Grid container={true} direction="row" alignItems="stretch" justify="space-between">
        <Grid item={true} style={{ width: '16%', backgroundColor: `${grey['A100']}` }}>
          <ReactContentLoader style={{ width: '100%' }} width={200} height={300}>
            <rect x="20" y="15" rx="10" ry="10" width="160" height="20" />
            <rect x="20" y="45" rx="5" ry="5" width="90" height="10" />
            <rect x="20" y="75" rx="3" ry="3" width="160" height="30" />
            <rect x="20" y="145" rx="5" ry="5" width="90" height="10" />
            <rect x="20" y="165" rx="5" ry="5" width="160" height="10" />
            <rect x="20" y="185" rx="5" ry="5" width="160" height="10" />
            <rect x="20" y="205" rx="5" ry="5" width="160" height="10" />
          </ReactContentLoader>
        </Grid>
        <Grid item={true} style={{ width: '64%' }}>
          <ReactContentLoader style={{ width: '100%' }} width={200}>
            <rect x="5" y="5" rx="4" ry="4" width="50" height="8" />
            <rect x="175" y="5" rx="2" ry="2" width="8" height="8" />
            <rect x="188" y="5" rx="2" ry="2" width="8" height="8" />
          </ReactContentLoader>
        </Grid>
        <Grid item={true} style={{ width: '20%', backgroundColor: `${grey['50']}` }}>
          <ReactContentLoader style={{ width: '100%' }} width={200} height={200}>
            <rect x="15" y="20" rx="4" ry="4" width="60" height="8" />
            <circle cx="30" cy="55" r="16" />
            <circle cx="75" cy="55" r="16" />
            <circle cx="120" cy="55" r="16" />
          </ReactContentLoader>
        </Grid>
      </Grid>
    );
  }
}

ContentLoader.dependencies = [Grid];

export default withTheme(ContentLoader);
