import NationalInsigniaBadge from "@/components/NationalInsigniaBadge";
import {
  getDefaultNationalIdentity,
  getNationalIdentityByCode,
} from "@/domain/nationality/nationalities";

type CountryFlagBadgeProps = {
  code: string;
  dialCode?: string;
  showDialCode?: boolean;
  showCode?: boolean;
  size?: "sm" | "md" | "lg";
};

export default function CountryFlagBadge({
  code,
  showDialCode = false,
  showCode = true,
  size = "md",
}: CountryFlagBadgeProps) {
  const identity = getNationalIdentityByCode(code) ?? getDefaultNationalIdentity();

  return (
    <NationalInsigniaBadge
      identity={identity}
      showCode={showCode}
      showDialCode={showDialCode}
      size={size}
    />
  );
}
