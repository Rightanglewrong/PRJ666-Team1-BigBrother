// app/layout.js
import './globals.css';
import NavBar from '../components/NavBar';

export const metadata = {
  title: 'Big Brother App',
  description: 'Daycare Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavBar /> {}
        {children} {}
      </body>
    </html>
  );
}
