import Header from '@/components/Header'; // <-- Import the header
import './globals.css';

export const metadata = {
  title: 'SecurePark',
  description: 'Peer-to-peer parking sharing app',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header /> {/* <-- Add the header here */}
        <main>{children}</main>
      </body>
    </html>
  );
}