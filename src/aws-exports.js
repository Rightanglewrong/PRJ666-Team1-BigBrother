const awsconfig = {
    aws_project_region: process.env.NEXT_PUBLIC_AWS_REGION,  // Your AWS region
    aws_cognito_region: process.env.NEXT_PUBLIC_AWS_REGION,  // Your Cognito region (usually the same as the project region)
    aws_user_pools_id: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,  // Your Cognito User Pool ID
    aws_user_pools_web_client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,  // Your Cognito User Pool App Client ID
    oauth: {
        domain: 'big-brother2-pool.auth.us-east-1.amazoncognito.com/login?client_id=69n73oh4j7t8ou9f1u9sqs8e3g&response_type=code&scope=email+openid+phone&redirect_uri=https%3A%2F%2Fbig-brother-psi.vercel.app%2Fdashboard',  // Your Cognito Hosted UI domain
        scope: ['email', 'openid', 'profile'],  // Scopes you need for authentication
        redirectSignIn: 'https://prj-666-team1-big-brother.vercel.app/dashboard',  // URL to redirect after successful sign-in
        redirectSignOut: 'https://prj-666-team1-big-brother.vercel.app/',  // URL to redirect after successful sign-out
        responseType: 'code',  // Response type for OAuth2 (code or token)
    }
};

export default awsconfig;
