// pages/_app.js
import '../app/globals.css';
import NavBar from '../components/NavBar';
import Authenticate from '../components/authenticate';
import { ThemeProvider } from '@/components/ThemeContext';
import { HandModeProvider } from '@/components/HandModeContext';

export default function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider>
      <Authenticate>
        <HandModeProvider>
          <NavBar />
          <Component {...pageProps} />
        </HandModeProvider>
      </Authenticate>
    </ThemeProvider>
  );
}
