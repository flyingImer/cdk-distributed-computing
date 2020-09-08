# API Reference

**Classes**

Name|Description
----|-----------
[FanOutToLambdasViaQueue](#cdk-distributed-computing-fanouttolambdasviaqueue)|*No description*


**Structs**

Name|Description
----|-----------
[FanOutToLambdasViaQueueProps](#cdk-distributed-computing-fanouttolambdasviaqueueprops)|*No description*
[TaskPipeDeadLetterQueueConfig](#cdk-distributed-computing-taskpipedeadletterqueueconfig)|*No description*



## class FanOutToLambdasViaQueue  <a id="cdk-distributed-computing-fanouttolambdasviaqueue"></a>



__Implements__: [IConstruct](#constructs-iconstruct), [IConstruct](#aws-cdk-core-iconstruct), [IConstruct](#constructs-iconstruct), [IDependable](#aws-cdk-core-idependable)
__Extends__: [Construct](#aws-cdk-core-construct)

### Initializer




```ts
new FanOutToLambdasViaQueue(scope: Construct, id: string, props: FanOutToLambdasViaQueueProps)
```

* **scope** (<code>[Construct](#aws-cdk-core-construct)</code>)  *No description*
* **id** (<code>string</code>)  *No description*
* **props** (<code>[FanOutToLambdasViaQueueProps](#cdk-distributed-computing-fanouttolambdasviaqueueprops)</code>)  *No description*
  * **workerFunctionProps** (<code>[FunctionProps](#aws-cdk-aws-lambda-functionprops)</code>)  *No description* 
  * **batchSize** (<code>number</code>)  A knob to tweak how many messages a work can take at a time. __*Default*__: 1.
  * **taskPipeDeadLetterQueueConfig** (<code>[TaskPipeDeadLetterQueueConfig](#cdk-distributed-computing-taskpipedeadletterqueueconfig)</code>)  *No description* __*Default*__: SQS queue with 14 day retention period, allowing 2 unsuccessful dequeues before being moved to this dead-letter queue.
  * **taskPipeVisibilityTimeout** (<code>[Duration](#aws-cdk-core-duration)</code>)  Note that this number should not be less than Worker Function timeout. __*Default*__: same as Worker Function timeout.



### Properties


Name | Type | Description 
-----|------|-------------
**taskPipe** | <code>[Queue](#aws-cdk-aws-sqs-queue)</code> | <span></span>
**taskPipeUrl** | <code>string</code> | <span></span>
**worker** | <code>[Function](#aws-cdk-aws-lambda-function)</code> | <span></span>
**taskPipeDLQ**? | <code>[DeadLetterQueue](#aws-cdk-aws-sqs-deadletterqueue)</code> | __*Optional*__

### Methods


#### grantSendMessages(grantee) <a id="cdk-distributed-computing-fanouttolambdasviaqueue-grantsendmessages"></a>

Helper method to grant access to send messages to a queue to the given identity.

Under the hood, it simply calls the corresponding SQS api.

If you need more control, feel free to operate directly against the queue object.

```ts
grantSendMessages(grantee: IGrantable): Grant
```

* **grantee** (<code>[IGrantable](#aws-cdk-aws-iam-igrantable)</code>)  Principal to grant send rights to.

__Returns__:
* <code>[Grant](#aws-cdk-aws-iam-grant)</code>



## struct FanOutToLambdasViaQueueProps  <a id="cdk-distributed-computing-fanouttolambdasviaqueueprops"></a>






Name | Type | Description 
-----|------|-------------
**workerFunctionProps** | <code>[FunctionProps](#aws-cdk-aws-lambda-functionprops)</code> | <span></span>
**batchSize**? | <code>number</code> | A knob to tweak how many messages a work can take at a time.<br/>__*Default*__: 1.
**taskPipeDeadLetterQueueConfig**? | <code>[TaskPipeDeadLetterQueueConfig](#cdk-distributed-computing-taskpipedeadletterqueueconfig)</code> | __*Default*__: SQS queue with 14 day retention period, allowing 2 unsuccessful dequeues before being moved to this dead-letter queue.
**taskPipeVisibilityTimeout**? | <code>[Duration](#aws-cdk-core-duration)</code> | Note that this number should not be less than Worker Function timeout.<br/>__*Default*__: same as Worker Function timeout.



## struct TaskPipeDeadLetterQueueConfig  <a id="cdk-distributed-computing-taskpipedeadletterqueueconfig"></a>






Name | Type | Description 
-----|------|-------------
**deadLetterQueue**? | <code>[DeadLetterQueue](#aws-cdk-aws-sqs-deadletterqueue)</code> | __*Default*__: SQS queue with 14 day retention period, allowing 2 unsuccessful dequeues before being moved to this dead-letter queue.
**enabled**? | <code>boolean</code> | __*Default*__: true.



