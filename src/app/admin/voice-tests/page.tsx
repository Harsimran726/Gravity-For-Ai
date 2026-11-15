import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/auth';
import { voiceTestConfiguration } from '@/lib/voice-test-providers';
import { VoiceTestDashboard } from './voice-test-dashboard';

export const dynamic = 'force-dynamic';

export default async function VoiceTestsPage() {
  const session = await getAdminSession();
  if (!session) redirect('/admin/login');
  if (session.role !== 'ADMIN') redirect('/admin');
  return <VoiceTestDashboard configuration={voiceTestConfiguration()} />;
}
