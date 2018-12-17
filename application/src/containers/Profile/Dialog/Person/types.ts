/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-21 16:25:35
 * Copyright © RingCentral. All rights reserved.
 */

import PersonModel from '@/store/models/Person';

type ProfileDialogPersonProps = {
  id: number; // person id
  dismiss: () => void;
};

type ProfileDialogPersonViewProps = ProfileDialogPersonProps & {
  person: PersonModel;
};

export { ProfileDialogPersonProps, ProfileDialogPersonViewProps };
