import NavBar from '../components/NavBar';
import '../app/globals.css';
import { Amplify } from 'aws-amplify';
import awsExports from '../aws-exports';  // Import your aws-exports.js configuration

Amplify.configure(awsExports);

function MyApp({ Component, pageProps }) {
  return (
    <>
      <NavBar /> {/* Render the NavBar component */}
      <Component {...pageProps} /> {/* Render the page component */}
    </>
  );
}

export default MyApp;
