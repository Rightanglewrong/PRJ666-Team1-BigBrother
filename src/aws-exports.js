const awsconfig = {
    aws_project_region: process.env.NEXT_PUBLIC_AWS_REGION,  // Your AWS region
    aws_cognito_region: process.env.NEXT_PUBLIC_AWS_REGION,  // Your Cognito region (usually the same as the project region)
    aws_user_pools_id: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,  // Your Cognito User Pool ID
    aws_user_pools_web_client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,  // Your Cognito User Pool App Client ID
    oauth: {
        domain: 'big-brother2-pool.auth.us-east-1.amazoncognito.com',  // Your Cognito Hosted UI domain
        scope: ['email', 'openid', 'profile'],  // Scopes you need for authentication
        redirectSignIn: 'https://prj-666-team1-big-brother.vercel.app/dashboard',  // URL to redirect after successful sign-in
        redirectSignOut: 'https://prj-666-team1-big-brother.vercel.app',  // URL to redirect after successful sign-out
        responseType: 'code',  // Response type for OAuth2 (code or token)
    }
};

export default awsconfig;
