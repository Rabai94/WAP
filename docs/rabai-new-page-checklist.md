# RabAI New Page Checklist

Acest checklist este obligatoriu pentru orice pagină nouă și pentru modificările structurale ale unei pagini existente. Nu începe implementarea înainte de pașii de audit.

## 1. Înainte de cod

- [ ] Am citit `AGENTS.md` și `apps/mobile/AGENTS.md`.
- [ ] Am citit `docs/rabai-design-system.md`.
- [ ] Am inspectat ruta, shell-ul, serviciile, hook-urile și componentele similare existente.
- [ ] Am verificat `apps/mobile/package.json` și versiunea Expo instalată.
- [ ] Am verificat API-urile în documentația oficială pentru versiunea instalată.
- [ ] Am confirmat că reutilizez ruta și logica business existente.
- [ ] Am identificat datele reale și nu folosesc date inventate.

## 2. Structura obligatorie

- [ ] Pagina folosește `PageContainer` / `Screen`.
- [ ] Pagina are `PageHeader` / `Header`.
- [ ] Conținutul este grupat prin `Section`, nu prin chenare pentru fiecare element.
- [ ] Acțiunile folosesc `RabAIButton` / `Button` sau `RabAIIconButton`.
- [ ] Cardurile folosesc `RabAICard` / `Card`.
- [ ] Formularele folosesc `RabAIInput` / `Input`, `FormField`, `RabAISelect` sau `RabAIAutocomplete`.
- [ ] Statusurile folosesc `RabAIBadge` / `StatusBadge`.
- [ ] Confirmările ireversibile folosesc `ConfirmationDialog`.

## 3. Template structural pentru o pagină nouă

Template-ul arată compoziția și ordinea stărilor. Înainte de copiere, inspectează exporturile și tipurile actuale din `@/components/ui`; nu inventa props sau contracte de servicii.

```tsx
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageContainer,
  PageHeader,
  RabAIButton,
  Section,
} from "@/components/ui";

export default function ExamplePage() {
  // Înlocuiește cu hook-ul/serviciul existent al feature-ului.
  const isLoading = false;
  const error: Error | null = null;
  const items: readonly unknown[] = [];

  const handleRetry = () => {
    // Handler real din fluxul existent.
  };

  const handlePrimaryAction = () => {
    // Handler real: navigare sau acțiune existentă.
  };

  return (
    <PageContainer scroll>
      <PageHeader
        title="Titlu localizat"
        description="Descriere localizată și concisă"
      />

      <Section title="Secțiune localizată">
        {isLoading ? (
          <LoadingState title="Se încarcă…" />
        ) : error ? (
          <ErrorState
            title="Conținutul nu a putut fi încărcat"
            description="Încearcă din nou."
            retryLabel="Reîncearcă"
            onRetry={handleRetry}
          />
        ) : items.length === 0 ? (
          <EmptyState
            title="Nu există rezultate"
            description="Explică de ce zona este goală și ce poate face utilizatorul."
            actionLabel="Acțiune reală"
            onAction={handlePrimaryAction}
          />
        ) : (
          <>{/* Randare cu primitive UI și date reale. */}</>
        )}
      </Section>

      <RabAIButton
        title="Acțiune principală"
        accessibilityLabel="Acțiune principală"
        onPress={handlePrimaryAction}
      />
    </PageContainer>
  );
}
```

Dacă API-ul public actual folosește un alias sau alte nume de props, adaptează template-ul la tipurile existente. Nu crea un wrapper local doar pentru a păstra textual exemplul.

## 4. Stări și date

- [ ] Loading, error, empty și normal sunt mutual exclusive.
- [ ] Error are retry real dacă operația este repetabilă.
- [ ] Empty explică situația și oferă CTA numai dacă există o acțiune reală.
- [ ] Skeleton-ul are semantică loading și nu simulează date inexistente.
- [ ] Datele stale nu sunt prezentate ca rezultat curent după error/empty.
- [ ] Mesajele tehnice sau sensibile din backend nu sunt afișate direct.
- [ ] Submit-ul previne apăsarea dublă și expune loading/disabled real.

## 5. Responsive

- [ ] La 320px nu există scroll orizontal, text tăiat sau controale inaccesibile.
- [ ] La 768px grupurile și acțiunile se rearanjează coerent.
- [ ] La 1024px și 1366px pagina funcționează corect în shell.
- [ ] La 1920px conținutul respectă max width-ul din tokeni.
- [ ] Textele lungi, localizările și adresele au `flex`/`minWidth` corect.
- [ ] Dropdown-urile și dialogurile rămân în viewport și au layering controlat.
- [ ] Pagina respectă safe areas pe iOS și Android.

## 6. Accesibilitate și interacțiuni

- [ ] Fiecare control are `accessibilityRole` și `accessibilityLabel` adecvate.
- [ ] Stările selected, checked, disabled, busy și invalid sunt expuse semantic.
- [ ] Toate controalele sunt accesibile din tastatură pe web.
- [ ] Focusul este vizibil și contrastant.
- [ ] Touch targets au minimum 44×44px.
- [ ] Hover și pressed sunt discrete și vizibile.
- [ ] Nu există nested `Pressable`.
- [ ] Statusurile nu depind numai de culoare.
- [ ] Loading/error sunt anunțate prin live-region potrivit.
- [ ] Dialogurile gestionează focusul, Escape și restaurarea focusului.
- [ ] Motion respectă `prefers-reduced-motion`.

## 7. Tokens și compoziție

- [ ] Culorile provin din tokeni semantici.
- [ ] Spacing-ul, radius-ul, typography și shadows provin din temă.
- [ ] Nu există hex/rgba local, radius local sau shadow local.
- [ ] Nu există breakpoint duplicat dacă tema/hook-ul îl oferă deja.
- [ ] Maximum o acțiune primary într-un grup.
- [ ] Acțiunile destructive sunt distincte și confirmate când este necesar.
- [ ] Chenarele grupează logic; nu fiecare text este într-un card.

## 8. Formulare și autocomplete

- [ ] Label-ul este asociat semantic cu inputul.
- [ ] Required, helper și error sunt complete și nu se suprapun.
- [ ] Disabled și read-only arată și se comportă diferit.
- [ ] Nu sunt folosite margini negative pentru alinierea erorilor.
- [ ] Sugestiile autocomplete sunt accesibile din tastatură și scrollabile.
- [ ] Dropdown-ul nu acoperă necontrolat câmpul următor.
- [ ] Tap-ul pe sugestii funcționează și cu tastatura mobilă deschisă.
- [ ] Selecția păstrează valoarea și ID-ul cerut de serviciul existent.

## 9. Validare înainte de predare

Din `apps/mobile`:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npx.cmd --no-install expo install --check
```

Din root:

```powershell
npm.cmd run ui:audit -- --strict apps/mobile/src/app/calea-paginii.tsx
git diff --check
git status --short
git diff --stat
```

- [ ] Am verificat conceptual sau vizual 320, 768, 1024, 1366 și 1920px.
- [ ] Am verificat keyboard, focus, hover, pressed, loading și disabled.
- [ ] Am verificat lipsa overflow-ului orizontal.
- [ ] Am raportat testele care nu au putut fi rulate.
- [ ] Am raportat orice abatere de la Design System V1 și motivul ei.
- [ ] Am confirmat că nu am schimbat Supabase, business logic, rute sau permisiuni fără autorizare explicită.
