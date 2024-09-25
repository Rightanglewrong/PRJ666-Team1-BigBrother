import NavBar from '../components/NavBar';
import '../app/globals.css';


function MyApp({ Component, pageProps }) {
  return (
    <>
      <NavBar /> {/* Render the NavBar component */}
      <Component {...pageProps} /> {/* Render the page component */}
    </>
  );
}

export default MyApp;
