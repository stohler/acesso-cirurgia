import { PRICE_DISCLAIMER } from "@/lib/constants";

export function PriceDisclaimer() {
  return (
    <p className="rounded-lg border border-[#FFB54766] bg-[#FFB5471A] p-3 text-xs leading-5 text-[var(--color-text-primary)]">
      <strong>Aviso importante:</strong> {PRICE_DISCLAIMER}
    </p>
  );
}
