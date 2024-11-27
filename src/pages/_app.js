// pages/_app.js
import '../app/globals.css';
import NavBar from '../components/NavBar';
import Authenticate from '../components/authenticate';
import { ThemeProvider } from '@/components/ThemeContext';

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Authenticate>
        <NavBar />
        <Component {...pageProps} />
      </Authenticate>
    </ThemeProvider>
  );
}