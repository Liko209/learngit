const { exec } = require('child_process');
exec(
  'git log -p packages/jui | grep commit | head -1',
  (err, juiCommit, stderr) => {
    if (err) {
      return;
    }
    exec('git log | grep commit | head -1', (err, fijiCommit) => {
      if (juiCommit.trim() === fijiCommit.trim()) {
        process.exit(1);
      }
    });
  },
);
