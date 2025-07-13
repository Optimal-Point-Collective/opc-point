import './globals.css';
import { Montserrat } from 'next/font/google';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'react-hot-toast';
import NavigationWrapper from './components/NavigationWrapper';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body className="font-montserrat bg-gray-900">
        <AuthProvider>
          <Toaster 
            toastOptions={{
              style: {
                background: '#BDB7A9',
                color: 'black',
              },
              success: {
                iconTheme: {
                  primary: 'black',
                  secondary: '#BDB7A9',
                },
              },
              error: {
                iconTheme: {
                  primary: 'red',
                  secondary: '#BDB7A9',
                },
              },
            }}
          />
          <NavigationWrapper>{children}</NavigationWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
