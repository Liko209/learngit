/*
 * @Author: Shining (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 17:27:47
 * Copyright © RingCentral. All rights reserved.
 */
import PersonModel from '@/store/models/Person';

type Props = {
  id: number;
};

type ViewProps = {
  id: number;
  person: PersonModel;
};

export { Props, ViewProps };
