import * as cdk from 'aws-cdk-lib/core';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class CognitoStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.userPool = new cognito.UserPool(this, 'TaskFlowUserPool', {
      userPoolName: "taskflow-user-pool",

      // サインイン設定
      signInAliases: {
        email: true,
        username: false,
      },

      // 自己サインアップを許可
      selfSignUpEnabled: true,

      // メール検証を必須に
      autoVerify: {
        email: true,
      },

      // 標準属性
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        givenName: {
          required: false,
          mutable: true,
        },
        familyName: {
          required: false,
          mutable: true,
        },
      },

      // カスタム属性
      customAttributes: {
        organizationId: new cognito.StringAttribute({
          mutable: true,
        }),
      },

      // パスワードポリシー
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
        tempPasswordValidity: cdk.Duration.days(7),
      },

      // アカウント復旧設定
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,

      // 削除保護（本番環境では RETAIN に）
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // App Client の作成
    this.userPoolClient = this.userPool.addClient("TaskFlowWebClient", {
      userPoolClientName: "taskflow-web-client",

      // 認証フロー
      authFlows: {
        userPassword: true,
        userSrp: true,
        custom: true,
      },

      // トークン有効期限
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),

      // クライアントシークレットを生成しない（SPA 用）
      generateSecret: false,

      // 認証エラーの詳細を防ぐ
      preventUserExistenceErrors: true,
    });

    // 出力
    new cdk.CfnOutput(this, "UserPoolId", {
      value: this.userPool.userPoolId,
      description: "Cognito User Pool ID",
    });

    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: this.userPoolClient.userPoolClientId,
      description: "Cognito User Pool Client ID",
    });

    new cdk.CfnOutput(this, "UserPoolRegion", {
      value: this.region,
      description: "AWS Region",
    });
  }
}
