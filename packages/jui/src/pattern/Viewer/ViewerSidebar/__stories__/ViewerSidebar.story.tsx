/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-29 10:00:02
 * Copyright © RingCentral. All rights reserved.
 */

import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';
import { JuiViewerSidebar } from '../ViewerSidebar';

const ViewerSidebar = () => {
  const [open, setOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const handleSelectedChanged = (idx: number) => {
    setCurrentIdx(idx);
  };
  const getItems = () => {
    const img = (
      <img
        style={{ width: '100%' }}
        src="https://via.placeholder.com/800x450.png?text=Viewer+Thumbnail+image+placeholder"
      />
    );
    return Array.from(Array(20)).map(() => {
      return img;
    });
  };
  return (
    <div style={{ display: 'flex', height: '500px' }}>
      <JuiViewerSidebar
        open={open}
        items={getItems()}
        selectedIndex={selectedIdx}
        onSelectedChanged={handleSelectedChanged}
      />
      <fieldset>
        <button onClick={() => setOpen(!open)}>toggle sidebar</button>
      </fieldset>
      <fieldset>
        <label htmlFor="pageNum">jump to pageNum: </label>
        <input
          id="pageNum"
          type="number"
          onChange={(e: any) => setSelectedIdx(Number(e.target.value - 1))}
        />
        <p>current Thumbnail Index: {currentIdx}</p>
        <p>current Thumbnail Number: {currentIdx + 1}</p>
      </fieldset>
    </div>
  );
};

storiesOf('Pattern/Viewer', module)
  .addDecorator(withInfoDecorator(JuiViewerSidebar, { inline: true }))
  .add('ViewerSidebar', () => <ViewerSidebar />);
