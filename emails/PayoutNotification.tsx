import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TornadoEvent } from "@/lib/types";

type Props = {
  to: string;
  payoutCents: number;
  walletCents: number;
  tornado: TornadoEvent;
  distanceMiles: number;
};

const usd = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    cents / 100
  );

const fmtDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const fmtMiles = (m: number) => (m < 0.1 ? `${(m * 5280).toFixed(0)} ft` : `${m.toFixed(2)} mi`);

export function PayoutNotification({
  payoutCents,
  walletCents,
  tornado,
  distanceMiles,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>We hope you and your family are okay. {usd(payoutCents)} is in your wallet.</Preview>
      <Body
        style={{
          background: "#050814",
          color: "#ffffff",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          margin: 0,
          padding: "32px 16px",
        }}
      >
        <Container
          style={{
            maxWidth: 540,
            margin: "0 auto",
            background: "linear-gradient(180deg,#0a1024 0%,#0f1730 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 24,
            overflow: "hidden",
          }}
        >
          <Section style={{ padding: "32px 32px 8px" }}>
            <Text
              style={{
                margin: 0,
                fontSize: 13,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#7af5c4",
              }}
            >
              StormRelief
            </Text>
            <Heading
              as="h1"
              style={{
                margin: "16px 0 8px",
                fontSize: 32,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                fontWeight: 500,
                color: "#ffffff",
                fontFamily: "Georgia, 'Iowan Old Style', serif",
              }}
            >
              We hope you and your family are okay.
            </Heading>
            <Text style={{ marginTop: 12, fontSize: 15, lineHeight: 1.65, color: "rgba(255,255,255,0.78)" }}>
              A qualifying tornado just passed within range of your home. Per
              your StormRelief plan, we&rsquo;ve sent{" "}
              <strong style={{ color: "#7af5c4" }}>{usd(payoutCents)}</strong>{" "}
              to your wallet — instantly, no claim required.
            </Text>
          </Section>

          <Section style={{ padding: "16px 32px" }}>
            <table
              width="100%"
              cellPadding={0}
              cellSpacing={0}
              role="presentation"
              style={{
                borderCollapse: "collapse",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
              }}
            >
              <tbody>
                <Row label="Tornado" value={`EF${tornado.ef} — ${tornado.location}`} />
                <Row label="Date" value={fmtDate(tornado.date)} />
                <Row label="Closest distance" value={fmtMiles(distanceMiles)} />
                <Row label="Payout" value={usd(payoutCents)} accent />
                <Row label="Wallet balance" value={usd(walletCents)} />
              </tbody>
            </table>
          </Section>

          <Section style={{ padding: "16px 32px 32px" }}>
            <Text style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.65)", marginBottom: 24 }}>
              We don&rsquo;t need anything from you right now. The relief is
              already there. If you need to talk to someone, reply to this
              email and a human will get back within an hour.
            </Text>
            <Button
              href="https://stormrelief.app/map"
              style={{
                background: "#38e8a4",
                color: "#050814",
                padding: "14px 24px",
                borderRadius: 14,
                fontWeight: 500,
                fontSize: 15,
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              Open your wallet
            </Button>
            <Hr style={{ borderColor: "rgba(255,255,255,0.06)", margin: "32px 0 16px" }} />
            <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", margin: 0 }}>
              StormRelief — No claims. No waiting. Just relief.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <tr>
      <td
        style={{
          padding: "12px 16px",
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: "0.16em",
          color: "rgba(255,255,255,0.45)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          width: "45%",
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding: "12px 16px",
          fontSize: 14,
          color: accent ? "#7af5c4" : "#ffffff",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          fontFamily: "Georgia, 'Iowan Old Style', serif",
          letterSpacing: "-0.01em",
        }}
      >
        {value}
      </td>
    </tr>
  );
}

export default PayoutNotification;
