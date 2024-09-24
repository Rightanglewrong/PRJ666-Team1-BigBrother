const awsconfig = {
    aws_project_region: "us-east-1",  // Your AWS region
    aws_cognito_region: "us-east-1",  // Your Cognito region (usually the same as the project region)
    aws_user_pools_id: "us-east-1_orRMV0tui",  // Your Cognito User Pool ID
    aws_user_pools_web_client_id: "69n73oh4j7t8ou9f1u9sqs8e3g",  // Your Cognito User Pool App Client ID
    oauth: {
        domain: 'big-brother2-pool.auth.us-east-1.amazoncognito.com',  // Your Cognito Hosted UI domain
        scope: ['email', 'openid', 'profile'],  // Scopes you need for authentication
        redirectSignIn: 'https://prj-666-team1-big-brother.vercel.app/dashboard',  // URL to redirect after successful sign-in
        redirectSignOut: 'https://prj-666-team1-big-brother.vercel.app',  // URL to redirect after successful sign-out
        responseType: 'token',  // Response type for OAuth2 (code or token)
    }
};

export default awsconfig;
