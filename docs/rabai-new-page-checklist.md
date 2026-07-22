# RabAI New Page Checklist

Acest checklist este obligatoriu pentru orice pagină nouă și modificare structurală. Contractul vizual este în `docs/rabai-design-system.md`; nu îl completa cu reguli locale contradictorii.

## Înainte de cod

- [ ] Am citit `AGENTS.md`, `apps/mobile/AGENTS.md` și design system-ul RabAI Signature.
- [ ] Am inspectat ruta, shell-ul, serviciile, hook-urile și componentele similare existente.
- [ ] Am verificat `apps/mobile/package.json`, versiunea Expo și documentația oficială compatibilă.
- [ ] Reutilizez ruta și logica business existente și folosesc date reale.
- [ ] Am ales tipul de pagină potrivit: Dashboard, Explorer/List, Detail/Quick View, Profile, Form, Settings, Empty state sau Admin/Owner dashboard.

## Shell și structură

- [ ] Pagina folosește `PageContainer` / `Screen` și `PageHeader` / `Header`.
- [ ] Folosește shell-ul corect: charcoal/ivory la desktop și drawer, nu sidebar permanent, la mobil.
- [ ] Nu creează shell dublu, outer card pentru aplicație sau navigație duplicată.
- [ ] Nu afișează email complet permanent ori funcții inactive/„în curând” în navigația principală.
- [ ] Conținutul este grupat prin `Section`, tipografie și spacing înaintea chenarelor.

## Compoziție și culoare

- [ ] Folosește primitivele din `@/components/ui` și tokeni semantici din `@/theme`.
- [ ] Nu există componente UI one-off, culori hex/rgba, radius sau shadows locale.
- [ ] Nu există card în card; cardurile reprezintă doar o suprafață sau unitate compusă reală.
- [ ] Listările de joburi, cursuri, aplicații și notificări folosesc rânduri, separatori fini și maximum două badge-uri vizibile per rând.
- [ ] Există maximum un primary CTA într-un grup.
- [ ] Gold este rar și nu apare pe fiecare border, icon sau titlu; nu semnalizează warning, succes, eroare sau destructive.
- [ ] Nu există texte sub 13 px, cu excepții documentate pentru audit.

## Formulare și filtre

- [ ] Formularul are maximum două suprafețe mari, fără card pentru fiecare grup mic.
- [ ] Save/Cancel sunt într-o zonă coerentă; helper și error rămân în flux normal.
- [ ] Autocomplete-ul este inline sau overlay complet controlat, accesibil din tastatură.
- [ ] Pe desktop filtrele principale sunt compacte, iar rezultatele sunt imediat vizibile.
- [ ] Pe mobil filtrele sunt într-un drawer/sheet, nu într-un zid de chips sau câmpuri dispersate.
- [ ] Butonul de filtre comunică numărul de filtre active.

## Stări, accesibilitate și responsive

- [ ] Loading, error, empty și normal sunt mutual exclusive; retry-ul este real când este posibil.
- [ ] Fiecare control are handler real, `accessibilityRole`, label, state, focus vizibil și target de minimum 44 × 44 px.
- [ ] Nu există nested `Pressable`; statusurile nu depind doar de culoare.
- [ ] Pagina nu are overflow la 320 px și se comportă corect la 768, 1024, 1025, 1366 și 1920 px; shell-ul nu sare paradoxal între 1024 și 1025.
- [ ] Textele lungi, localizările, dropdown-urile și dialogurile rămân în viewport.
- [ ] Motion respectă `prefers-reduced-motion`.

## Eliminarea Design Lab

- [ ] Nu există ruta `/design-lab`, variante `engine-a`/`engine-b`/`engine-c` sau preview Signature în arborele de producție.
- [ ] Nu există `experimentalTokens`, importuri din design-lab ori componente preview în produs sau export.
- [ ] Orice concept aprobat este implementat numai prin tokenii și primitivele globale RabAI Signature.

## Validare înainte de predare

Din root:

```powershell
npm.cmd run ui:audit
npm.cmd run ui:audit -- --strict
git diff --check
git status --short
git diff --stat
```

Din `apps/mobile`:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npx.cmd expo install --check
npx.cmd expo export --platform all --output-dir .expo\rabai-signature-final
```

- [ ] Am raportat orice validare care nu a putut fi rulată și orice abatere justificată.
- [ ] Nu am schimbat Supabase, servicii, logică business, autentificare sau rute fără autorizare explicită.
- [ ] Nu am făcut commit sau push fără confirmarea utilizatorului.
