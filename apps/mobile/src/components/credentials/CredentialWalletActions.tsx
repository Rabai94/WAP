import { Button } from "@/components/ui";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  buildCredentialVerificationUrl,
  getCredentialDownloadUrl,
  setCredentialVisibility,
  type CredentialDocumentStatus,
} from "@/services/credentials/credentialService";
import { Colors, Spacing, Typography } from "@/theme";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Linking, Share, StyleSheet, Text, View } from "react-native";

type CredentialWalletActionsProps = {
  credentialId: string;
  documentStatus: CredentialDocumentStatus;
  isPublic: boolean;
  onChanged: () => Promise<void> | void;
  title: string;
  verificationToken: string;
};

export default function CredentialWalletActions({
  credentialId,
  documentStatus,
  isPublic,
  onChanged,
  title,
  verificationToken,
}: CredentialWalletActionsProps) {
  const router = useRouter();
  const { t } = useLanguage();
  const [busyAction, setBusyAction] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const busyRef = useRef(false);

  async function runAction(action: string, callback: () => Promise<void>) {
    if (busyRef.current) {
      return;
    }

    busyRef.current = true;
    setBusyAction(action);
    setMessage("");
    setError("");
    try {
      await callback();
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : t("credentials.wallet.actionError"),
      );
    } finally {
      busyRef.current = false;
      setBusyAction("");
    }
  }

  const linkActionsDisabled = !isPublic || Boolean(busyAction);

  return (
    <View>
      <View style={styles.actions}>
        <Button
          disabled={Boolean(busyAction)}
          onPress={() => router.push(`/profile/wallet/${credentialId}` as never)}
          style={styles.action}
          title={t("credentials.wallet.view")}
          variant="secondary"
        />
        <Button
          disabled={documentStatus !== "ready" || Boolean(busyAction)}
          onPress={() => void runAction("download", async () => {
            const result = await getCredentialDownloadUrl(credentialId);
            const supported = await Linking.canOpenURL(result.signedUrl);
            if (!supported) {
              throw new Error(t("credentials.wallet.downloadUnsupported"));
            }
            await Linking.openURL(result.signedUrl);
            setMessage(t("credentials.wallet.downloadReady"));
          })}
          style={styles.action}
          title={busyAction === "download"
            ? t("credentials.wallet.preparing")
            : t("credentials.wallet.download")}
        />
        <Button
          disabled={linkActionsDisabled}
          onPress={() => void runAction("share", async () => {
            const url = buildCredentialVerificationUrl(verificationToken);
            await Share.share({ message: `${title}\n${url}`, title, url });
          })}
          style={styles.action}
          title={t("credentials.wallet.share")}
          variant="secondary"
        />
        <Button
          disabled={linkActionsDisabled}
          onPress={() => void runAction("copy", async () => {
            const copied = await Clipboard.setStringAsync(
              buildCredentialVerificationUrl(verificationToken),
            );
            if (!copied) {
              throw new Error(t("credentials.wallet.copyError"));
            }
            setMessage(t("credentials.wallet.copied"));
          })}
          style={styles.action}
          title={t("credentials.wallet.copyLink")}
          variant="secondary"
        />
        <Button
          disabled={Boolean(busyAction)}
          onPress={() => void runAction("visibility", async () => {
            await setCredentialVisibility(credentialId, !isPublic);
            await onChanged();
            setMessage(
              t(isPublic
                ? "credentials.wallet.hiddenSuccess"
                : "credentials.wallet.publicSuccess"),
            );
          })}
          style={styles.action}
          title={t(isPublic
            ? "credentials.wallet.hideFromProfile"
            : "credentials.wallet.showOnProfile")}
          variant="ghost"
        />
      </View>

      {!isPublic ? (
        <Text style={styles.hint}>{t("credentials.wallet.privateLinkHint")}</Text>
      ) : null}
      {message ? <Text accessibilityRole="alert" style={styles.success}>{message}</Text> : null}
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  action: {
    flexGrow: 1,
    minWidth: 136,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: Typography.small,
    marginTop: Spacing.md,
  },
  success: {
    color: Colors.success,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.md,
  },
  error: {
    color: Colors.danger,
    fontSize: Typography.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    marginTop: Spacing.md,
  },
});
