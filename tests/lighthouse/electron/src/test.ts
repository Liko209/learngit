import * as pidusage from 'pidusage';

const total = 16 * 1000 * 1000 * 1000;

setInterval(async () => {
  pidusage(60528, function (err, stats) {
    console.log(stats.cpu, stats.memory / total * 100);
  });
}, 1000);
