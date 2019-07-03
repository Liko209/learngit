/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-06-24 16:38:32
 * Copyright © RingCentral. All rights reserved.
 */

const { exec } = require('child_process');
const dir = process.argv[2];
exec(
  `git log -p packages/${dir} | grep commit | head -1`,
  (err, commit, stderr) => {
    if (err) {
      return;
    }
    exec('git log | grep commit | head -1', (err, fijiCommit) => {
      if (commit.trim() === fijiCommit.trim()) {
        process.exit(1);
      }
    });
  },
);
