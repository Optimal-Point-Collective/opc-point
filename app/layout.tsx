import './globals.css';
import { Montserrat } from 'next/font/google';
import NavigationWrapper from './components/NavigationWrapper';
import AuthProvider from '@/components/auth/AuthProvider';

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-montserrat',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
    <html lang="en" className={montserrat.variable}>
      <body className="font-montserrat bg-gray-900">
        <NavigationWrapper>{children}</NavigationWrapper>
      </body>
    </html>
    </AuthProvider>
  );
}
