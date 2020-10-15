const { AwsCdkConstructLibrary, Stability, Semver } = require('projen');

const project = new AwsCdkConstructLibrary({
  name: 'cdk-distributed-computing',
  description: 'A place holds distributed patterns using serverless power',

  stability: Stability.Experimental,

  authorName: 'Ej Wang',
  authorEmail: 'ej.wang.dev@gmail.com',
  repository: 'https://github.com/flyingImer/cdk-distributed-computing.git',

  compat: true,
  projenUpgradeSecret: 'PROJEN_UPGRADE_TOKEN',

  cdkVersion: '1.32.2',
  cdkDependencies: [
    '@aws-cdk/aws-dynamodb',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-lambda-event-sources',
    '@aws-cdk/aws-sqs',
    "@aws-cdk/core"
  ],

  devDependencies: {
    'aws-sdk': Semver.caret('2.708.0')
  }
});

project.gitignore.exclude('.env');
project.gitignore.include('example/tsconfig.json');
project.gitignore.exclude('example/*.js', 'example/*.d.ts', 'example/cdk.out', 'example/lambda/*.js', 'example/lambda/*.d.ts');

project.synth();
