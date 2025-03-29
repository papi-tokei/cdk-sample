import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export class CdkSampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDBのテーブルを作成する
    const table = new dynamodb.Table(this, 'SampleTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      tableName: 'SampleTable',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda関数を作成する(GET用)
    const getLambda = new lambda.Function(this, 'GetLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'get.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // Lambda関数を作成する(POST用)
    const postLambda = new lambda.Function(this, 'PostLambda', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'post.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // DynamoDBテーブルへのアクセス権限をLambda関数に付与する
    // GET Lambdaに対してテーブルの読み取り権限を付与
    table.grantReadData(getLambda);
    // POST Lambdaに対してテーブルの書き込み権限を付与
    table.grantWriteData(postLambda);

    // API Gatewayを作成する
    const api = new apigateway.RestApi(this, 'SampleApi', {
      restApiName: 'Sample Service',
      apiKeySourceType: apigateway.ApiKeySourceType.HEADER,
    });

    // APIキーを作成する
    const apiKey = api.addApiKey('ApiKey');

    // 使用量プランを作成し、APIキーと紐づける
    const usagePlan = api.addUsagePlan('UsagePlan', {
      name: 'BasicUsagePlan',
      throttle: {
        rateLimit: 10,
        burstLimit: 2,
      },
    });
    usagePlan.addApiKey(apiKey);
    usagePlan.addApiStage({
      stage: api.deploymentStage,
    });

    // API GatewayとLambda関数を紐づける
    const getIntegration = new apigateway.LambdaIntegration(getLambda);
    api.root.addMethod('GET', getIntegration, {
      apiKeyRequired: true, // Require API key
    });

    // API GatewayとLambda関数を紐づける
    const postIntegration = new apigateway.LambdaIntegration(postLambda);
    api.root.addMethod('POST', postIntegration, {
      apiKeyRequired: true, // Require API key
    });
  }
}
