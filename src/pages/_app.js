import NavBar from '../components/NavBar';
import '../app/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <NavBar /> {}
      <Component {...pageProps} /> {}
    </>
  );
}

export default MyApp;
