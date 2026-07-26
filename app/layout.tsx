import type {Metadata} from 'next';
import './globals.css'; // Global styles

import {SettingsProvider} from '@/features/settings/settings-provider';

export const metadata: Metadata = {
  title: 'AI Service Desk — Ethiopian Government Services',
  description:
    'Understand requirements, documents, fees, and next steps for Ethiopian government services before you apply.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <SettingsProvider>{children}</SettingsProvider>
      </body>
    </html>
  );
}
