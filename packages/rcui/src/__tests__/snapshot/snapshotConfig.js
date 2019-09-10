/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-06-21 10:00:29
 * Copyright © RingCentral. All rights reserved.
 */

/**
  * you can skip certain story for snapshot here,
  *
  *
   storiesOf('Avatar', module)
     .addParameters({ jest: ['Avatar'] })
     .add('Image', () => {
     return <RuiAvatar size={knobs.size()} src={avatar} />;
     })
  .add('Name', () => {
    return (
      <RuiAvatar size={knobs.size()} color={knobs.color()}>
        SH
      </RuiAvatar>
    );
  });

  * put Avatar in kind array will skip this whole stories
  * put Image into name will only skip that particular story
  */

const excludeDomSnapshot = {
  kind: ['Forms/Slider', 'Components/ExpansionPanel'],
  name: ['SuffixFollowTextField', 'IconList', 'Iconography', 'Tooltip'],
  matchFunction: ({
    name,
    kind
  }) => {
    return /HoC/.test(kind);
  },
};

export {
  excludeDomSnapshot,
  excludeImageSnapshot,
  fullScreenStory
};
