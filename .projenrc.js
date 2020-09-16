const { ConstructLibrary, Stability, Semver } = require('projen');

const CONSTRUCTS_DEPENDENCY = {
  'constructs': Semver.caret('2.0.0')
}
const CDK_PINNED_VERSION = Semver.pinned('1.32.2');
const CDK_DEPENDENCIES = [
  '@aws-cdk/aws-dynamodb',
  '@aws-cdk/aws-iam',
  '@aws-cdk/aws-lambda',
  '@aws-cdk/aws-lambda-event-sources',
  '@aws-cdk/aws-sqs',
  "@aws-cdk/core"
].reduce((obj, e) => {
  obj[e] = CDK_PINNED_VERSION
  return obj
}, {});

const project = new ConstructLibrary({
  name: `cdk-distributed-computing-${CDK_PINNED_VERSION.version.replace(/\./g, '-')}`,
  description: `A place holds distributed patterns using serverless power (targeting cdk v${CDK_PINNED_VERSION.version})`,

  stability: Stability.Experimental,

  authorName: 'Ej Wang',
  authorEmail: 'ej.wang.dev@gmail.com',
  repository: 'https://github.com/flyingImer/cdk-distributed-computing.git',

  releaseBranches: [
    'master',
    'pinned-1.32.2'
  ],

  peerDependencies: { 
    ...CDK_DEPENDENCIES,
    ...CONSTRUCTS_DEPENDENCY,
  },
  dependencies: CDK_DEPENDENCIES,
  peerDependencyOptions: {
    pinnedDevDependency: false,
  },

  devDependencies: {
    'aws-sdk': Semver.caret('2.708.0'),
    '@aws-cdk/assert': CDK_PINNED_VERSION,
  },
});

project.gitignore.exclude('.env');
project.gitignore.include('example/tsconfig.json');
project.gitignore.exclude('example/*.js', 'example/*.d.ts', 'example/cdk.out', 'example/lambda/*.js', 'example/lambda/*.d.ts');

project.addScript('bump', 'yarn --silent no-changes || standard-version release --prerelease cdk1.32.2');

project.synth();
