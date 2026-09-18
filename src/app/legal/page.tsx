import type { Metadata } from 'next';
import LegalView from '@/components/LegalView';

export const metadata: Metadata = {
  title: 'Privacy & Terms',
  description: 'Privacy Policy and Terms for the Sound Archives music portfolio.',
};

export default function LegalPage() {
  return <LegalView />;
}
