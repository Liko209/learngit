/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-04 09:16:54
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import Axios from 'axios';
import styled from '../../styled-components';

function loadIconList() {
  return Axios.get(
    'https://s3.amazonaws.com/icomoon.io/79019/Jupiter/symbol-defs.svg',
  )
    .then((res: any) => {
      const re = /<title>(.+?)<\/title>/g;
      const matches: any = [];
      (res.data as string).replace(re, function (m: any, p1: any) {
        matches.push(p1);
      } as any);
      return matches;
    })
    .catch(() => {
      return null;
    });
}

const StyledList = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
`;
const StyledIcon = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 10px;
  & svg {
    outline: silver solid 1px;
    width: 1em;
    height: 1em;
    font-size: 36px;
  }
`;

class IconList extends React.Component {
  state = {
    state: 'loading icons',
    icons: [],
  };
  async componentDidMount() {
    const icons = await loadIconList();
    if (icons) {
      this.setState({ icons, state: 'icon loaded' });
    } else {
      this.setState({ state: 'network error, refresh to retry' });
    }
  }

  render() {
    return (
      <div>
        <h2> {this.state.state}</h2>
        <h3>total {this.state.icons.length} icons</h3>
        <StyledList>
          {this.state.icons.map(icon => (
            <StyledIcon>
              <svg>
                <use xlinkHref={`#icon-${icon}`} href={`#icon-${icon}`} />
              </svg>
              {icon}
            </StyledIcon>
          ))}
        </StyledList>
      </div>
    );
  }
}

storiesOf('Foundation', module).add('IconList', () => <IconList />);
