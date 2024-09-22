import NavBar from '../components/NavBar';
import '../app/globals.css';
import { Amplify } from 'aws-amplify';
import awsconfig from '../aws-exports';  // Import your aws-exports.js configuration

Amplify.configure(awsconfig);



function MyApp({ Component, pageProps }) {
  return (
    <>
      <NavBar /> {}
      <Component {...pageProps} /> {}
    </>
  );
}

export default MyApp;
