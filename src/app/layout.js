import './globals.css'; // import your global styles
import NavBar from '../components/NavBar'; // adjust path if needed

export const metadata = {
  title: 'Big Brother App',
  description: 'A child monitoring and management application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavBar /> {/* Navbar will now be displayed across all pages */}
        {children} {/* This will render the content of each page */}
      </body>
    </html>
  );
}
