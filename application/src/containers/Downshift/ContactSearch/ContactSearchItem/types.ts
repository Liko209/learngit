/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-04-08 17:34:38
 * Copyright © RingCentral. All rights reserved.
 */
import PersonModel from '@/store/models/Person';

type Props = {
  itemId: number;
};

type ViewProps = Props & {
  person: PersonModel;
  isHighlighted: boolean;
  avatar?: React.ReactElement;
};

export { Props, ViewProps };
