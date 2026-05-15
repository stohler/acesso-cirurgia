import { PRICE_DISCLAIMER } from "@/lib/constants";

export function PriceDisclaimer() {
  return (
    <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
      <strong>Aviso importante:</strong> {PRICE_DISCLAIMER}
    </p>
  );
}
