const options = {
  branches: [
    'master',
  ],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        preset: "angular",
        releaseRules: "./release-rules.js"
      }
    ],
    [
      "@semantic-release/npm",
      {
        npmPublish: false
      }
    ]
  ],
  options: {
    tagFormat: 'v${version}',
  },
};

const branch = process.env.CURRENT_BRANCH;

if (/^stage\/.+/.test(branch)) {
  options.branches.push({
    name: branch,
    prerelease: 'alpha',
    channel: 'alpha',
  })
}

if (/^release\/.+/.test(branch)) {
  options.branches.push({
    name: branch,
    prerelease: 'RC',
    channel: 'RC',
  })
}

if ('chore/FIJI-7143' === branch) {
  options.branches.push({
    name: branch,
    prerelease: 'alpha',
    channel: 'alpha',
  })
}

if (/^__debug__\/.+/.test(branch)) {
  options.branches.push({
    name: branch,
    prerelease: '__debug__',
    channel: '__debug__',
  })
}

module.exports = options;