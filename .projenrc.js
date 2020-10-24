const { AwsCdkConstructLibrary, Stability, Semver } = require('projen');

const CDK_VERSION = '1.69.0';

const project = new AwsCdkConstructLibrary({
  name: 'cdk-distributed-computing',
  description: 'A place holds distributed patterns using serverless power',

  stability: 'experimental',

  authorName: 'Ej Wang',
  authorEmail: 'ej.wang.dev@gmail.com',
  repository: 'https://github.com/flyingImer/cdk-distributed-computing.git',

  catalog: {
    announce: false,
  },

  compat: true,
  projenUpgradeSecret: 'PROJEN_UPGRADE_TOKEN',

  cdkVersion: CDK_VERSION,
  cdkAssert: false,

  devDependencies: {
    'aws-sdk': Semver.caret('2.708.0'),
    'monocdk': Semver.pinned(CDK_VERSION),
    '@monocdk-experiment/assert': Semver.pinned(CDK_VERSION),
    'constructs': Semver.pinned('3.0.4'),
  },

  peerDependencies: {
    'monocdk': Semver.caret(CDK_VERSION),
    'constructs': Semver.caret('3.0.4'),
  }
});

project.gitignore.exclude('.env');
project.gitignore.include('example/tsconfig.json');
project.gitignore.exclude('example/*.js', 'example/*.d.ts', 'example/cdk.out', 'example/lambda/*.js', 'example/lambda/*.d.ts');

project.synth();
