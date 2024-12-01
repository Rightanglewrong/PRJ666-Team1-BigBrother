// app/layout.js
import './globals.css';
import NavBar from '../components/NavBar';
import { HandModeProvider } from '@/components/HandModeContext';

export const metadata = {
  title: 'Big Brother App',
  description: 'Daycare Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavBar /> {}
        <HandModeProvider>{children}</HandModeProvider>
      </body>
    </html>
  );
}
