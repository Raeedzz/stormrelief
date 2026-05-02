import { Resend } from "resend";
import { render } from "@react-email/components";
import { env, isDev } from "./env";
import { PayoutNotification } from "@/emails/PayoutNotification";
import type { TornadoEvent } from "./types";

export type EmailArgs = {
  to: string;
  payoutCents: number;
  walletCents: number;
  tornado: TornadoEvent;
  distanceMiles: number;
};

export async function sendPayoutEmail(args: EmailArgs): Promise<"sent" | "logged" | "skipped"> {
  const html = await render(PayoutNotification(args));
  const subject = "We hope you and your family are okay.";

  if (!env.RESEND_API_KEY) {
    if (isDev) {
      console.log("\n[StormRelief] Email (dev mode, no RESEND_API_KEY set):");
      console.log(`  To: ${args.to}`);
      console.log(`  Subject: ${subject}`);
      console.log(`  Payout: $${(args.payoutCents / 100).toFixed(2)}`);
      console.log(`  Tornado: ${args.tornado.location} EF${args.tornado.ef} (${args.tornado.date})`);
      console.log(`  Distance: ${args.distanceMiles.toFixed(2)} mi\n`);
    }
    return "logged";
  }

  try {
    const resend = new Resend(env.RESEND_API_KEY);
    await resend.emails.send({
      from: env.RESEND_FROM,
      to: args.to,
      subject,
      html,
    });
    return "sent";
  } catch (err) {
    console.error("[StormRelief] Resend send failed:", err);
    return "skipped";
  }
}
