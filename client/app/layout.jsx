import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ThemeProvider } from '../components/ThemeProvider';
import { Toaster } from 'sonner';
import { AuthProvider } from '../src/context/AuthContext';

export const metadata = {
  title: {
    default: 'StudioSpace — Creative Studio Booking Platform',
    template: '%s | StudioSpace',
  },
  description: 'StudioSpace is a peer-to-peer marketplace for creative studios. Book photography studios, sound stages, podcast rooms, music suites, and art workshops.',
  keywords: ['studio booking', 'photography studio', 'podcast room', 'music suite', 'creative space'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-base-100 text-base-content">
        <AuthProvider>
          <ThemeProvider>
            <Header />
            <main className="flex-grow container mx-auto px-4 py-6">
              {children}
            </main>
            <Footer />
            <Toaster position="bottom-right" richColors />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
