// pages/_app.js
import '../app/globals.css';
import NavBar from '../components/NavBar';
import Authenticate from '../components/authenticate';

export default function MyApp({ Component, pageProps }) {
  return (
    <Authenticate>
      <NavBar />
      <Component {...pageProps} />
    </Authenticate>
  );
}

