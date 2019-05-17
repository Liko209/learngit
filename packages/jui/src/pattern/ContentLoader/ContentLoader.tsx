import React, { PureComponent, Fragment } from 'react';
import ReactContentLoader from 'react-content-loader';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import { withTheme } from 'styled-components';
import styled from '../../foundation/styled-components';
import { ThemeProps } from '../../foundation/theme/theme';
import { width } from '../../foundation/utils/styles';
import { RuiCircularProgress } from 'rcui/components/Progress';

const WrapperCircularProgress = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: ${width(10.5)};
  height: ${width(10.5)};
`;
class ContentLoader extends PureComponent<ThemeProps> {
  static dependencies: React.ComponentType[] = [Grid];

  render() {
    const {
      theme: {
        palette: { grey },
        size: { width, height },
      },
    } = this.props;
    return (
      <Fragment>
        <Grid
          style={{ height: '100%' }}
          container={true}
          direction="column"
          justify="space-between"
        >
          <Grid
            style={{
              width: '100%',
              height: `${16 * width}px`,
              borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
            }}
            container={true}
            direction="row"
            justify="space-between"
          >
            <Grid
              item={true}
              style={{
                width: `${85 * width}px`,
                height: `${16 * width}px`,
              }}
            >
              <ReactContentLoader width={85 * width} height={16 * height}>
                <rect
                  x={`${6 * width}`}
                  y={`${5 * height}`}
                  rx={width}
                  ry={height}
                  width={`${6 * width}`}
                  height={`${6 * height}`}
                />
                <rect
                  x={`${24 * width}`}
                  y={`${5 * height}`}
                  rx={width}
                  ry={height}
                  width={`${35 * width}`}
                  height={`${6 * height}`}
                />
              </ReactContentLoader>
            </Grid>
            <Hidden only={['xs', 'sm']}>
              <Grid
                item={true}
                style={{
                  height: `${16 * width}px`,
                  flex: 1,
                }}
              >
                <ReactContentLoader
                  height={16 * height}
                  width={136.5 * width}
                  preserveAspectRatio="none"
                  style={{
                    width: '100%',
                    height: `${16 * height}px`,
                  }}
                >
                  <rect
                    x={0}
                    y={3 * height}
                    width="100%"
                    height="62.5%"
                    rx={width}
                    ry={height}
                  />
                </ReactContentLoader>
              </Grid>
            </Hidden>
            <Hidden only={['xs']}>
              <Grid
                item={true}
                style={{
                  height: `${16 * width}px`,
                  width: `${67 * width}px`,
                }}
              >
                <ReactContentLoader width={67 * width} height={16 * height}>
                  <rect
                    x={`${42 * width}`}
                    y={`${5 * height}`}
                    rx={width}
                    ry={height}
                    width={`${6 * width}`}
                    height={`${6 * height}`}
                  />
                  <circle
                    cx={`${58 * height}`}
                    cy={`${8 * height}`}
                    r={`${5 * width}`}
                  />
                </ReactContentLoader>
              </Grid>
            </Hidden>
          </Grid>
          <Grid
            container={true}
            direction="row"
            alignItems="stretch"
            justify="space-between"
            style={{
              flex: 1,
            }}
          >
            <Grid
              container={true}
              direction="column"
              justify="space-between"
              style={{
                width: `${18 * width}px`,
                backgroundColor: `${grey['50']}`,
                borderRight: '1px solid rgba(0, 0, 0, 0.12)',
              }}
            >
              <ReactContentLoader
                style={{ width: `${18 * width}px`, height: `${50 * height}px` }}
                width={18 * width}
                height={50 * height}
              >
                <rect
                  x={6 * width}
                  y={12 * height}
                  rx={width}
                  ry={height}
                  width={6 * width}
                  height={6 * height}
                />
                <rect
                  x={6 * width}
                  y={27 * height}
                  rx={width}
                  ry={height}
                  width={6 * width}
                  height={6 * height}
                />
                <rect
                  x={6 * width}
                  y={42 * height}
                  rx={width}
                  ry={height}
                  width={6 * width}
                  height={6 * height}
                />
              </ReactContentLoader>
              <ReactContentLoader
                style={{ width: `${18 * width}px`, height: `${62 * height}px` }}
                width={18 * width}
                height={62 * height}
              >
                <rect
                  x={6.5 * width}
                  rx={width}
                  ry={height}
                  width={5 * width}
                  height={5 * height}
                />
                <rect
                  x={6.5 * width}
                  y={12 * height}
                  rx={width}
                  ry={height}
                  width={5 * width}
                  height={5 * height}
                />
                <rect
                  x={6.5 * width}
                  y={24 * height}
                  rx={width}
                  ry={height}
                  width={5 * width}
                  height={5 * height}
                />
                <rect
                  x={6.5 * width}
                  y={36 * height}
                  rx={width}
                  ry={height}
                  width={5 * width}
                  height={5 * height}
                />
                <rect
                  x={6.5 * width}
                  y={48 * height}
                  rx={width}
                  ry={height}
                  width={5 * width}
                  height={5 * height}
                />
              </ReactContentLoader>
            </Grid>
            <Hidden only="xs">
              <Grid
                item={true}
                style={{
                  width: `${67 * width}px`,
                  backgroundColor: `${grey['50']}`,
                  borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                }}
              >
                <ReactContentLoader
                  style={{
                    width: `${67 * width}px`,
                    height: `${70 * height}px`,
                  }}
                  width={67 * width}
                  height={70 * height}
                >
                  <rect
                    x={6 * width}
                    y={3.5 * height}
                    rx={width}
                    ry={height}
                    width={55 * width}
                    height={6 * height}
                  />
                  <rect
                    x={6 * width}
                    y={14.5 * height}
                    rx={width}
                    ry={height}
                    width={55 * width}
                    height={6 * height}
                  />
                  <rect
                    x={6 * width}
                    y={25.5 * height}
                    rx={width}
                    ry={height}
                    width={55 * width}
                    height={6 * height}
                  />
                  <rect
                    x={6 * width}
                    y={41.5 * height}
                    rx={width}
                    ry={height}
                    width={55 * width}
                    height={6 * height}
                  />
                  <rect
                    x={6 * width}
                    y={52.5 * height}
                    rx={width}
                    ry={height}
                    width={55 * width}
                    height={6 * height}
                  />
                  <rect
                    x={6 * width}
                    y={63.5 * height}
                    rx={width}
                    ry={height}
                    width={55 * width}
                    height={6 * height}
                  />
                </ReactContentLoader>
              </Grid>
            </Hidden>
            <Grid
              item={true}
              style={{
                borderRight: '1px solid rgba(0, 0, 0, 0.12)',
                position: 'relative',
                flex: 1,
              }}
            >
              <WrapperCircularProgress>
                <RuiCircularProgress size={42} />
              </WrapperCircularProgress>
            </Grid>
            <Hidden only={['xs', 'sm']}>
              <Grid
                item={true}
                style={{
                  width: `${67 * width}px`,
                  backgroundColor: `${grey['50']}`,
                }}
              >
                <ReactContentLoader
                  style={{ width: '100%', height: `${67 * height}px` }}
                  width={67 * width}
                  height={67 * height}
                >
                  <rect
                    x={`${4 * width}`}
                    y={`${2.5 * height}`}
                    rx={width}
                    ry={height}
                    width={`${42 * width}`}
                    height={`${7 * height}`}
                  />
                  <rect
                    x={`${4 * width}`}
                    y={`${14.5 * height}`}
                    rx={width}
                    ry={height}
                    width={`${57 * width}`}
                    height={`${6 * height}`}
                  />
                  <circle
                    cx={`${8 * width}`}
                    cy={`${29.5 * height}`}
                    r={`${4 * width}`}
                  />
                  <circle
                    cx={`${20 * width}`}
                    cy={`${29.5 * height}`}
                    r={`${4 * width}`}
                  />
                  <circle
                    cx={`${32 * height}`}
                    cy={`${29.5 * height}`}
                    r={`${4 * width}`}
                  />
                </ReactContentLoader>
              </Grid>
            </Hidden>
          </Grid>
        </Grid>
      </Fragment>
    );
  }
}

const JuiContentLoader = withTheme(ContentLoader);

export { JuiContentLoader };
