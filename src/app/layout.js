import './globals.css'; 
import NavBar from '../components/NavBar'; 

export const metadata = {
  title: 'Big Brother App',
  description: 'A child monitoring and management application',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavBar /> 
        <div className="container mx-auto p-4">
          {children}
        </div>
      </body>
    </html>
  );
}
