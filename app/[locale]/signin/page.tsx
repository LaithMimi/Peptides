import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getSessionPhone } from "@/lib/session";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { SigninForm } from "@/components/signin-form";

export default async function SignInPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Already verified: skip the step entirely.
  if (await getSessionPhone()) {
    redirect({ href: "/quote", locale });
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8">
      <DisclaimerBanner />
      <SigninForm />
    </div>
  );
}
