const { ConstructLibraryAws, Stability, Semver } = require('projen');

const project = new ConstructLibraryAws({
  name: 'cdk-distributed-computing',

  stability: Stability.Experimental,

  authorName: 'Ej Wang',
  authorEmail: 'ej.wang.dev@gmail.com',
  repository: 'https://github.com/flyingImer/cdk-distributed-computing.git',

  cdkVersion: '1.32.2',
  cdkDependencies: [
    '@aws-cdk/aws-dynamodb',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-lambda-event-sources',
    '@aws-cdk/aws-sqs',
    "@aws-cdk/core"
  ],

  devDependencies: {
    "aws-sdk": Semver.caret("2.708.0")
  }
});

project.gitignore.exclude('.env');

project.synth();
