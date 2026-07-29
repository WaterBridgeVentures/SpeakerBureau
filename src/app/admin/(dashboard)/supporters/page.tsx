import { requireSuperAdmin } from '@/lib/dal';
import { createClient } from '@/lib/supabase/server';
import { AddSupporterForm } from '@/app/admin/_components/AddSupporterForm';
import { SupporterRow } from '@/app/admin/_components/SupporterRow';

export default async function SupportersPage() {
  await requireSuperAdmin();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('supporters')
    .select('*')
    .order('org_name', { ascending: true });

  if (error) {
    return <p className="text-sm text-red-600">Failed to load: {error.message}</p>;
  }
  const supporters = data ?? [];

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Supporters</h2>

      <AddSupporterForm />

      {supporters.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          No supporters yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {supporters.map((s) => (
            <SupporterRow key={s.id} supporter={s} />
          ))}
        </ul>
      )}
    </section>
  );
}
