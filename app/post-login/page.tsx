import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

export default async function PostLogin() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  if (session.user.isAdmin) {
    redirect('/admin');
  }

  redirect('/equipo');
}
