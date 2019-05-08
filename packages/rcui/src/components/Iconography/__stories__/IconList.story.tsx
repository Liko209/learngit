/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-03-04 09:16:54
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import Axios from 'axios';
import styled from '../../../foundation/styled-components';
import localIcons from '../icon-symbol.svg';

const StyledList = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
`;
const StyledIcon = styled.div<{ state: string }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: 10px;
  color: ${({ state }) => {
    switch (state) {
      case 'new':
        return 'green';
      case 'delete':
        return 'red';
      default:
        return 'black';
    }
  }};

  & svg {
    margin-bottom: 4px;
    box-shadow: 0 0 10px
      ${({ state }) => {
        switch (state) {
          case 'exist':
            return 'silver';
          case 'new':
            return 'green';
          case 'delete':
            return 'red';
          default:
            return 'silver';
        }
      }};
    width: 1em;
    height: 1em;
    font-size: 36px;
  }
`;

class IconList extends React.Component {
  state = {
    state: 'loading icons',
    icons: [],
    localCount: 0,
    latestCount: 0,
  };
  async getNewestIconList() {
    return Axios.get(
      `https://i.icomoon.io/public/6483cc0f53/Jupiter/symbol-defs.svg?${Math.random()}`,
    )
      .then((res: any) => {
        this.insertSVG(res.data);
        const icons = this.getIconList(res.data);
        this.setState({ latestCount: icons.length });
        return icons;
      })
      .catch(() => {
        return null;
      });
  }

  async getLocalIconList() {
    return Axios.get(localIcons)
      .then((res: any) => {
        const icons = this.getIconList(res.data);
        this.setState({ localCount: icons.length });
        return icons;
      })
      .catch(() => null);
  }

  getIconList(svgData: string) {
    const re = /<title>(.+?)<\/title>/g;
    const matches: any = [];
    svgData.replace(re, function (m: any, p1: any) {
      matches.push(p1);
    } as any);
    return matches;
  }
  async componentDidMount() {
    const latestIcons = (await this.getNewestIconList()) as string[];
    const localIcons = (await this.getLocalIconList()) as string[];
    if (!latestIcons || !localIcons) {
      this.setState({ state: 'network error, refresh to retry' });
    } else {
      const iconList: any = [];
      latestIcons.forEach((icon: string) => {
        if (localIcons.includes(icon)) {
          iconList.push({ name: icon, state: 'exist' });
        } else {
          iconList.push({ name: icon, state: 'new' });
        }
      });
      localIcons.forEach((icon: string) => {
        if (!latestIcons.includes(icon)) {
          iconList.push({ name: icon, state: 'delete' });
        }
      });
      this.setState({ icons: iconList, state: 'icon loaded' });
    }
  }

  insertSVG(data: string) {
    const body = document.body;
    const x = document.createElement('x');
    x.innerHTML = data;
    let svg;
    svg = x.getElementsByTagName('svg')[0];
    if (svg) {
      svg.setAttribute('aria-hidden', 'true');
      svg.style.position = 'absolute';
      svg.style.width = '0';
      svg.style.height = '0';
      svg.style.overflow = 'hidden';
      body.insertBefore(svg, body.firstChild);
    }
  }

  private _renderIcon(icon: any) {
    return (
      <StyledIcon state={icon.state} key={icon.name}>
        <svg>
          <use xlinkHref={`#icon-${icon.name}`} />
        </svg>
        {icon.name}
      </StyledIcon>
    );
  }

  render() {
    return (
      <div>
        <h2> {this.state.state}</h2>
        <h3>current icon number: {this.state.localCount}</h3>
        <h3>latest icon number: {this.state.latestCount}</h3>
        <p>
          green shadow means this icon is not in current version of icon yet,
          you can update icon by running 'npm run update-icon'
        </p>
        <p>
          red shadow means this icon is deleted, they will not be available in
          next version of icon
        </p>
        <StyledList>
          {this.state.icons.map((icon: any) => this._renderIcon(icon))}
        </StyledList>
        <script
          defer={true}
          src={`https://i.icomoon.io/public/6483cc0f53/Jupiter/svgxuse-s3.js?${Math.random()}`}
        />
      </div>
    );
  }
}

storiesOf('Icon', module).add('IconList', () => <IconList />);
