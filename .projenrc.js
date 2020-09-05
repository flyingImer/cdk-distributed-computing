const { ConstructLibraryAws } = require('projen');

const project = new ConstructLibraryAws({
  "name": "cdk-distributed-computing",
  "authorName": "Ej Wang",
  "authorEmail": "ej.wang.dev@gmail.com",
  "repository": "https://github.com/flyingImer/cdk-distributed-computing.git"
});

project.synth();
