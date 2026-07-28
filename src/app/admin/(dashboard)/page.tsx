import { redirect } from 'next/navigation';

// /admin → default to the first tab.
export default function AdminIndex() {
  redirect('/admin/nominations');
}
