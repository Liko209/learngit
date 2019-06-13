/*
 * @Author: Conner (conner.kang@ringcentral.com)
 * @Date: 2019-05-29 10:00:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { useState } from 'react';
import { storiesOf } from '@storybook/react';
import { withInfoDecorator } from '../../../../foundation/utils/decorators';
import { JuiViewerDocument } from '../ViewerDocument';

type ScaleType = number;
type ViewportType = {
  width: number;
  height: number;
};

const ViewerDocument = () => {
  const [scale, setScale] = useState(1);
  const [currentScale, setCurrentScale] = useState<ScaleType>(1);
  const [pageIndex, setPageIndex] = useState(0);
  const [currentPageIdx, setCurrentPageIdx] = useState(0);

  const getLoading = () => {
    const loading = (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          fontSize: '50px',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        loading....
      </div>
    );
    return loading;
  };

  const [loading, setLoading] = useState<any>(getLoading());

  setTimeout(() => {
    setLoading(null);
  },         2000);

  const getPages = () => {
    const width = 800;
    const height = 600;
    const getImg = (idx: number) => (
      <img
        style={{ width: '100%' }}
        src={`https://via.placeholder.com/800x600.png?text=Viewer+Page+image+placeholder+${idx}`}
      />
    );

    return Array.from(Array(30)).map((item, idx) => {
      return {
        loading,
        getViewport: () => ({
          width,
          height,
        }),
        cmp: getImg(idx),
      };
    });
  };
  return (
    <div>
      <fieldset>
        <label htmlFor="scale">set scale: </label>
        <input
          id="scale"
          defaultValue="1"
          type="number"
          step="0.1"
          onChange={(e: any) => setScale(Number(e.target.value))}
        />
        <p>current Scale: {currentScale}</p>
      </fieldset>
      <fieldset>
        <label htmlFor="pageIndex">set page index: </label>
        <input
          id="pageIndex"
          defaultValue="0"
          type="number"
          onChange={(e: any) => setPageIndex(Number(e.target.value))}
        />
        <p>current page idx: {currentPageIdx}</p>
      </fieldset>
      <div
        style={{
          height: '750px',
          border: '1px solid blue',
          position: 'relative',
        }}
      >
        <JuiViewerDocument
          pages={getPages()}
          pageIndex={pageIndex}
          scale={scale}
          onScaleChange={scale => scale && setCurrentScale(Number(scale))}
          onCurrentPageIdxChanged={idx => setCurrentPageIdx(idx)}
        />
      </div>
    </div>
  );
};

storiesOf('Pattern/Viewer', module)
  .addDecorator(withInfoDecorator(JuiViewerDocument, { inline: true }))
  .add('ViewerDocument', () => <ViewerDocument />);
