/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2019-06-21 08:52:16
 * Copyright © RingCentral. All rights reserved.
 */
import _ from 'lodash';
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import styled from '../../../foundation/styled-components';
import { JuiAutoSizer, Size } from '../AutoSizer';
import { JuiVirtualizedList } from '../../VirtualizedList';

const ROW_HEIGHT = 20;
const ListWrapper = styled.div`
  background: #f1f1f1;
`;
const Row = styled.div`
  height: ${ROW_HEIGHT};
`;

storiesOf('Components/AutoSizer', module).add('AutoSizer', () => {
  return (
    <JuiAutoSizer>
      {({ height }: Size) => (
        <ListWrapper>
          <JuiVirtualizedList minRowHeight={ROW_HEIGHT} height={height}>
            {_.range(1, 2).map(n => (
              <Row key={n}>Row-{n}</Row>
            ))}
          </JuiVirtualizedList>
        </ListWrapper>
      )}
    </JuiAutoSizer>
  );
});
