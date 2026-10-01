import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { adminLogin } from "@/app/admin/actions/auth";
import { AdminField, AdminForm, adminInput } from "@/components/admin/admin-form";

export const metadata = { title: "Sign in" };

export default async function AdminLoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-12">
     <div className="flex flex-col gap-6 rounded-xl border border-border-strong bg-surface p-6 shadow-sm">
      <h1 className="font-serif text-2xl font-semibold uppercase tracking-wide text-navy">
        Admin sign in
      </h1>
      <AdminForm action={adminLogin} submitLabel="Sign in">
        <AdminField name="email" label="Email">
          <input id="email" name="email" type="email" autoComplete="username" required className={adminInput} />
        </AdminField>
        <AdminField name="password" label="Password">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className={adminInput}
          />
        </AdminField>
      </AdminForm>
     </div>
    </main>
  );
}
