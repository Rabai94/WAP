# RabAI Design System V1

## Scop

Acest document este contractul tehnic pentru interfața RabAI pe web, Android și iOS. El transformă direcția din `design/01_Brand_DNA/RabAI_Design_DNA.md` în reguli aplicabile codului. Nu schimbă rute, autentificare, permisiuni, servicii, date sau logică business.

Orice pagină nouă sau modificată trebuie să respecte `AGENTS.md`, acest document și `docs/rabai-new-page-checklist.md`.

## Surse de adevăr

Ordinea de consultare este:

1. `AGENTS.md` și `apps/mobile/AGENTS.md` pentru reguli obligatorii;
2. `apps/mobile/src/theme` pentru design tokens;
3. `apps/mobile/src/components/ui` pentru primitive și compoziție;
4. acest document pentru utilizare și decizii de design;
5. `design/01_Brand_DNA/RabAI_Design_DNA.md` pentru direcția de brand.

Nu crea un al doilea sistem de tokeni sau o bibliotecă paralelă de componente.

## Direcție vizuală

RabAI este o aplicație profesională pentru muncă, firme, cursuri și servicii. Interfața trebuie să fie calmă, clară și eficientă:

- fundaluri neutre și luminoase;
- navy și albastru RabAI folosite controlat pentru identitate și acțiuni;
- contrast accesibil și ierarhie vizuală clară;
- borduri fine, colțuri moderate și spațiere confortabilă;
- densitate potrivită unei aplicații business;
- umbre discrete numai când explică nivelul unei suprafețe;
- fără neon, gradient excesiv sau glassmorphism greu;
- fără carduri sau hero-uri autentificate supradimensionate;
- fără cutie separată pentru fiecare text sau icon.

## Design tokens

Codul de produs consumă tokeni semantici din `@/theme`. Numele semantice descriu rolul, nu culoarea brută.

### Culori

API-ul principal trebuie să acopere cel puțin:

- `background`, `surface`, `surfaceMuted`, `surfaceElevated`;
- `border`, `borderStrong`;
- `textPrimary`, `textSecondary`, `textMuted`;
- `primary`, `primaryHover`, `primaryPressed`;
- `danger`, `success`, `warning`, `information`;
- `focusRing`.

Nu folosi nume publice de forma `blue1` sau `gray2`. Valorile brute și aliasurile temporare pot exista numai în implementarea temei, nu în pagini.

### Celelalte familii de tokeni

Folosește tokenii publicați pentru:

- spacing;
- radius;
- typography;
- icon sizes;
- control heights;
- page widths și gutters;
- breakpoints;
- elevation/shadows;
- motion durations;
- opacity;
- z-index/layers.

O valoare numerică locală este acceptabilă numai când reprezintă o constrângere de conținut unică și este justificată printr-un comentariu scurt. Culorile, radius-ul și umbrele nu se hardcodează în pagini.

## API-ul componentelor UI

Importă primitivele din barrel-ul `@/components/ui`. Numele canonice RabAI și aliasurile de migrare fac parte din aceeași familie; nu implementa o variantă locală cu `Pressable`, `View` sau `TextInput` dacă familia existentă acoperă cazul.

- `RabAIButton` / `Button`: acțiuni primary, secondary, outline, ghost și destructive; suportă size, icon, loading, disabled și full width.
- `RabAIIconButton`: acțiuni exclusiv prin icon, cu label/tooltip și target de minimum 44px.
- `RabAICard` / `Card`: suprafețe outlined, filled, elevated, interactive, selected și disabled.
- `RabAIInput` / `Input` și `FormField`: label, required, helper, error, prefix/suffix, loading, disabled și read-only.
- `RabAISelect`: selecție dintr-o listă controlată.
- `RabAIAutocomplete`: sugestii async, navigare din tastatură și layering controlat.
- `RabAIBadge` / `StatusBadge`: status comunicat prin text și, când ajută, icon; niciodată doar prin culoare.
- `PageContainer` / `Screen`: safe area, lățime maximă, gutters responsive și protecție împotriva overflow-ului orizontal.
- `PageHeader` / `Header`: titlu, descriere, back/breadcrumbs și acțiuni responsive.
- `Section`: grup logic cu titlu, descriere, acțiune și spacing standard.
- `EmptyState`, `LoadingState`, `ErrorState` și `Skeleton`: stările explicite ale conținutului.
- `ConfirmationDialog`: confirmare accesibilă, inclusiv acțiuni destructive, loading și management de focus.

Aliasurile există pentru migrare. Codul nou preferă numele canonice RabAI atunci când acestea sunt exportate de API-ul curent. Verifică întotdeauna tipurile componentei înainte de utilizare; nu inventa props.

## Butoane și interacțiuni

- Într-un grup există maximum o acțiune primary.
- Acțiunile secundare folosesc secondary, outline sau ghost.
- O acțiune periculoasă folosește destructive și un dialog de confirmare când efectul nu este ușor reversibil.
- Niciun buton vizibil nu poate avea handler lipsă sau no-op.
- `loading` trebuie să prevină apăsarea repetată și să păstreze un label accesibil.
- `disabled` trebuie aplicat controlului, nu doar simulat prin opacity.
- Hover, pressed și focus sunt discrete, vizibile și consecvente.
- Touch target-ul minim este 44×44px, chiar dacă iconul este mai mic.
- Nu imbrica `Pressable` în `Pressable`.

## Carduri și chenare

Un card grupează informații care aparțin aceleiași unități sau acțiuni. Folosește tipografie, spațiu și suprafețe înainte de a adăuga încă un border.

- `outlined` este varianta implicită pentru grupare neutră;
- `filled` separă discret o zonă de fundal;
- `elevated` se folosește rar, pentru nivel sau suprapunere reală;
- `interactive` trebuie să aibă hover, pressed, focus și semantică accesibilă;
- `selected` și `disabled` trebuie să fie perceptibile și fără dependență exclusivă de culoare.

Nu transforma fiecare paragraf, label, statistică sau icon într-un card separat.

## Formulare

- Label-ul este deasupra controlului și asociat semantic cu acesta.
- Required, helper și error au loc rezervat sau curgere normală; nu folosi margini negative.
- Erorile sunt complete, lizibile și anunțate tehnologiilor asistive.
- Controalele din același formular folosesc înălțimi și spacing comune.
- Focus, disabled și read-only sunt vizual distincte.
- Submit-ul este protejat împotriva trimiterii duble și afișează loading.
- Grupurile radio/select au rol și stare corecte, nu doar culoare.
- Datele se validează client-side și server-side fără schimbarea contractului serviciilor.

### Autocomplete

- Sugestiile trebuie să poată fi parcurse cu tastatura pe web.
- Lista expune stări loading, empty și error.
- Dropdown-ul nu acoperă necontrolat câmpurile următoare și nu taie mesaje sau opțiuni.
- În formularele înguste, preferă spațiu rezervat/in-flow; overlay-ul este permis doar cu layering, scroll și focus controlate.
- Selecția păstrează atât label-ul, cât și identificatorul cerut de serviciul existent.
- Scroll container-ul părinte păstrează tap-urile pe sugestii când tastatura este deschisă.

## Layout și responsive

Toate paginile folosesc `PageContainer` și compun conținutul prin `PageHeader` și `Section`.

Verifică minimum:

- 320px: o singură coloană, fără overflow orizontal;
- 768px: tabletă, grupuri și acțiuni care se pot rearanja;
- 1024px și 1366px: shell și conținut desktop echilibrat;
- 1920px: conținut limitat prin page width, fără întindere excesivă.

Folosește breakpoints și page widths din temă. Nu introduce praguri locale pentru același comportament deja modelat de tokeni sau hook-ul responsive.

## Stări obligatorii

Orice conținut async trebuie să aibă stări mutual exclusive:

1. loading;
2. error, cu retry real când operația poate fi repetată;
3. empty, cu explicație și CTA real când există o acțiune utilă;
4. normal;
5. disabled/loading pentru acțiunile care modifică date.

Nu afișa simultan date stale și un empty state. Nu expune direct mesaje tehnice sensibile din backend.

## Accesibilitate

- Furnizează `accessibilityRole`, `accessibilityLabel` și `accessibilityState` potrivite.
- Focusul din tastatură este vizibil pe toate controalele web.
- Dialogurile mută focusul în interior, răspund la Escape, îl capturează cât sunt deschise și îl restaurează la trigger.
- Informația de status nu depinde numai de culoare.
- Loading/error sunt anunțate prin semantică live adecvată.
- Respectă reduced motion și nu elimina accesibilitatea pentru efecte vizuale.

## Compatibilitate platforme și warning-uri web

- `pointerEvents` se configurează în `style`, nu ca prop deprecated pe web.
- Umbrele folosesc tokeni platform-specific: `boxShadow` pe web și implementarea nativă compatibilă pe iOS/Android.
- `textShadow` shorthand se folosește pe web, iar proprietățile native se păstrează pe platformele native.
- Nu face înlocuiri globale oarbe și nu elimina suportul native pentru a ascunde un warning web.

## Interdicții

În pagini noi sau modificate nu sunt permise:

- culori hex/rgba locale pentru UI;
- radius sau shadows locale;
- butoane, carduri și inputuri one-off;
- acțiuni fără handler;
- nested `Pressable`;
- date inventate pentru a umple stări;
- scroll orizontal accidental;
- duplicarea navigării, a rutelor sau a logicii business.

## Validare

Din `apps/mobile`:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npx.cmd --no-install expo install --check
```

Din root:

```powershell
npm.cmd run ui:audit
git diff --check
git status --short
git diff --stat
```

`ui:audit` este advisory implicit și verifică numai pagini noi/untracked. Folosește `npm.cmd run ui:audit -- --strict` când avertismentele trebuie să producă exit code nenul sau pasează explicit căi pentru o verificare țintită.
