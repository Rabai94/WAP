# RabAI Design System — RabAI Signature

## Scop și autoritate

Acesta este contractul vizual unic pentru produsul RabAI pe web, Android și iOS. El stabilește direcția RabAI Signature, utilizarea tokenilor, shell-ul, compoziția componentelor și patternurile responsive. Nu schimbă rute, autentificare, permisiuni, servicii, date sau logică business.

Orice pagină nouă sau modificată respectă `AGENTS.md`, acest document și `docs/rabai-new-page-checklist.md`. `AGENTS.md` păstrează regulile generale, de siguranță și calitate; nu dublează regulile vizuale de aici. Când documentele intră în conflict asupra unei decizii vizuale, acest document prevalează.

Ordinea de consultare este:

1. `AGENTS.md` și `apps/mobile/AGENTS.md` pentru reguli generale și de siguranță;
2. acest document pentru contractul vizual RabAI Signature;
3. `apps/mobile/src/theme` pentru tokenii implementați;
4. `apps/mobile/src/components/ui` pentru primitive și compoziție;
5. `docs/rabai-new-page-checklist.md` pentru verificarea implementării;
6. `design/01_Brand_DNA/RabAI_Design_DNA.md` pentru intenția de brand, fără a duplica reguli UI.

Nu crea un al doilea sistem de tokeni sau o bibliotecă paralelă de componente.

## Direcția RabAI Signature

RabAI este un instrument de lucru profesionist pentru oportunități, învățare, firme și servicii. Interfața trebuie să pară calmă, matură și exactă: spațiul și tipografia explică structura înaintea chenarelor.

- shell-ul desktop este charcoal foarte închis;
- canvas-ul principal este warm ivory, lizibil și odihnitor;
- suprafețele folosesc neutre calde, cu contrast accesibil;
- gold mat este un accent rar, nu o culoare de umplere universală;
- succesul folosește verde matur; roșul este rezervat danger/destructive;
- listările se exprimă implicit prin rânduri scanabile;
- cardurile apar numai când formează o unitate compusă sau o suprafață distinctă;
- umbrele sunt rare și explică numai suprapunere sau nivel real.

Nu sunt permise glow-uri aurii, gradiente aurii ostentative, estetică de casino/crypto/gaming, wallpaper AI, glassmorphism excesiv sau pagini complet negre greu de citit. Nu folosi gold pentru warning, succes, eroare sau acțiuni destructive.

## Tokeni și culoare

Codul de produs consumă numai tokeni semantici din `@/theme`. Numele publice descriu rolul, nu valoarea brută: `background`, `surface`, `surfaceMuted`, `surfaceElevated`, `border`, `borderStrong`, `textPrimary`, `textSecondary`, `textMuted`, `primary`, `primaryHover`, `primaryPressed`, `danger`, `success`, `warning`, `information` și `focusRing`.

Paleta implementată pentru RabAI Signature este:

| Rol semantic | Valoare | Utilizare |
| --- | --- | --- |
| `shellBackground` | `#101214` | fundalul shell-ului desktop |
| `shellSurface` / `shellElevated` | `#171A1D` / `#202428` | navigație și niveluri reale pe shell |
| `canvas` | `#F4F0E7` | canvas principal warm ivory |
| `surface` / `surfaceMuted` | `#FAF7F0` / `#EDE7DB` | suprafețe de lucru și grupări discrete |
| `textPrimary` / `textSecondary` / `textMuted` | `#191A1C` / `#494744` / `#6B665E` | ierarhia textului pe canvas |
| `border` / `borderStrong` | `#D8D1C4` / `#8C8377` | separatori și contururi funcționale |
| `goldPrimary` / `goldHover` / `goldPressed` | `#A98538` / `#D0AF63` / `#A47E2E` | CTA primar și stările sale |
| `goldMuted` / `focusRing` | `#E9DDBF` / `#9C7727` | selecție discretă și focus vizibil |
| `success` / `warning` / `danger` / `information` | `#287052` / `#8A570B` / `#9F2D32` / `#245F86` | stări funcționale distincte de gold |

Migrarea paletei existente la RabAI Signature se face în tema globală, nu prin culori locale în pagini. Nu hardcoda hex, rgba, radius sau shadows în UI de produs. O valoare numerică locală este permisă doar pentru o constrângere unică de conținut și trebuie justificată printr-un comentariu scurt.

Folosește și familiile existente de tokeni pentru spacing, radius, typography, icon sizes, control heights, page widths, gutters, breakpoints, elevation, motion, opacity și layers.

### Reguli pentru gold

Gold este permis numai pentru:

- un primary CTA în grupul său;
- focus ring;
- stare activă discretă;
- detaliu de brand rar;
- icon sau separator important.

Gold nu este permis pe fiecare border, icon sau titlu; ca text lung pe fundal deschis; sau ca semnal semantic pentru succes, warning, eroare și destructive.

## Tipografie și spacing

Folosește aceeași scară din temă în toate paginile și maximum cinci roluri:

| Rol | Utilizare |
| --- | --- |
| Display/page title | titlul principal al paginii |
| Section heading | titlu de secțiune sau grup logic |
| Body | conținut principal și informație de lucru |
| Supporting text | explicații, metadata și descrieri secundare |
| Label/caption | label de control, status scurt sau caption |

- body are 14–16 px;
- supporting text are minimum 13 px;
- textele de 9–10 px nu sunt permise;
- folosește maximum trei greutăți principale; extraBold/black apare rar, pentru ierarhie reală;
- line-height-ul rămâne confortabil și nu este comprimat pentru a obține densitate;
- folosește spacing și separatori fini înainte de un card sau border nou.

## Primitive UI, butoane și interacțiuni

Importă primitivele din barrel-ul `@/components/ui`. Codul nou preferă numele canonice RabAI atunci când sunt exportate și verifică tipurile înainte de utilizare.

- `RabAIButton` / `Button` pentru acțiuni primary, secondary, outline, ghost și destructive;
- `RabAIIconButton` pentru acțiuni doar cu icon, cu label/tooltip și target de minimum 44 px;
- `RabAICard` / `Card` numai pentru suprafețe compuse;
- `RabAIInput` / `Input`, `FormField`, `RabAISelect` și `RabAIAutocomplete` pentru formulare;
- `RabAIBadge` / `StatusBadge` pentru status comunicat prin text, nu doar culoare;
- `PageContainer`, `PageHeader`, `Section`, `EmptyState`, `LoadingState`, `ErrorState`, `Skeleton` și `ConfirmationDialog` pentru structură și stări.

Într-un grup există maximum un primary CTA. Toate controalele vizibile au handler real; `loading` previne acțiunea repetată, iar `disabled` este aplicat controlului. Acțiunile destructive folosesc varianta dedicată și confirmare când efectul nu este ușor reversibil. Nu imbrica `Pressable` în `Pressable`.

## Liste, carduri, badge-uri și filtre

Joburile, cursurile, aplicațiile și notificările folosesc implicit rânduri. Un rând separă informația prin spacing, tipografie și separator fin; nu printr-o cutie individuală pentru fiecare atribut.

- cardurile sunt rezervate unei unități compuse, unui panou distinct sau unei suprapuneri reale;
- nu există card în card;
- `outlined` nu este varianta implicită pentru toate grupările;
- nu pune fiecare paragraf, statistică, label sau icon într-o cutie;
- un rând de listă afișează maximum două badge-uri vizibile;
- statusul rămâne explicit prin text și nu depinde exclusiv de culoare.

Pe desktop, filtrele principale sunt compacte, filtrele avansate stau într-un control secundar, iar rezultatele sunt vizibile imediat. Pe mobil, filtrele apar într-un drawer sau sheet controlat: fără zid de chips, fără câmpuri dispersate și cu un buton clar care arată numărul filtrelor active.

## Shell și navigație

- desktop: shell charcoal, sidebar compact și canvas ivory;
- mobil: sidebar-ul devine drawer; nu rămâne permanent;
- topbar-ul este simplu și nu dublează navigația;
- nu afișa permanent emailul complet;
- nu pune funcții inactive sau „în curând” în navigația principală;
- nu monta un shell experimental în shell-ul real;
- nu încadra întreaga aplicație într-un outer card.

Toate paginile folosesc `PageContainer` și își compun conținutul cu `PageHeader` și `Section`, cu excepția wrapperelor de rută care deleagă explicit către o pagină componentă. Păstrează contextul de navigație și nu crea rute sau shell-uri paralele fără autorizare.

## Formulare și autocomplete

- folosește maximum două suprafețe mari într-un formular;
- nu crea un card pentru fiecare grup mic de câmpuri;
- label-ul este deasupra controlului și asociat semantic;
- required, helper și error rămân în flux normal, fără margini negative;
- Save/Cancel stau într-o zonă coerentă; există maximum un primary CTA;
- focusul gold este discret și oferă contrast suficient;
- autocomplete-ul este inline sau overlay complet controlat, navigabil din tastatură și cu layering, focus și scroll corecte;
- submit-ul este protejat împotriva trimiterii duble și păstrează loading/disabled real;
- datele se validează client-side și server-side, fără a schimba contractul serviciilor.

## Companion și asseturi

RabAI Companion este un produs separat. Site-ul nu afișează o bulă draggable permanentă și mascota nu acoperă conținutul. În web poate apărea discret în branding sau notificări, cu un rol funcțional clar; nu este doar decor.

Nu folosi robotul albastru ca identitate RabAI. Verifică asseturile reale înainte de a inventa un placeholder, ilustrație sau mascotă.

## Eliminarea Design Lab

RabAI Signature este sistemul de producție, nu un preview. Ruta `/design-lab`, variantele `engine-a`, `engine-b`, `engine-c`, preview-urile Signature, tokenii experimentali și importurile lor nu sunt permise în sursa sau exportul aplicației. Explorările viitoare se țin în afara arborelui de producție; un concept aprobat intră numai prin tokenii globali, primitivele comune, review-ul checklistului și auditul strict.

## Tipuri de pagină

Fiecare tip păstrează `PageContainer`, un header clar, maximum un primary CTA per grup și stări loading/error/empty/normal mutual exclusive.

| Tip | Shell și header | Conținut și acțiune | Responsive și stări |
| --- | --- | --- | --- |
| Dashboard | shell standard, header cu rezumat scurt | priorități, activitate și rânduri de lucru; CTA pentru următorul pas | coloană unică la mobil; skeleton/error/empty pentru fiecare zonă async |
| Explorer/List | shell standard, header cu căutare și filtre | rânduri scanabile, rezultate imediat vizibile; CTA contextual | filtre în drawer pe mobil; loading, error cu retry și empty explicativ |
| Detail/Quick View | shell standard, header cu context/back | informație principală, metadata și acțiune relevantă | secțiuni stivuite la mobil; loading/error/empty pentru resursa cerută |
| Profile | shell standard, header identitar concis | sumar, date editabile și progres real | acțiunile se rearanjează; loading/error/empty pentru date lipsă |
| Form | shell standard, header cu scop | maximum două suprafețe mari și zonă unică Save/Cancel | o coloană la mobil; helper/error/loading în flux normal |
| Settings | shell standard, header simplu | grupări funcționale, nu carduri individuale; CTA contextual | drawer mobil pentru secțiuni lungi; loading/error/empty unde datele sunt async |
| Empty state | shell standard, header păstrat | explicație utilă și CTA numai dacă este real | mesajul rămâne lizibil și acționabil la 320 px |
| Admin/Owner dashboard | shell charcoal cu navigație compactă | statusuri, cozi și listări dense în rânduri; CTA operațional | sidebar devine drawer; loading/error/empty fără a bloca contextul |

## Layout, responsive și accesibilitate

Verifică minimum 320, 768, 1024, 1025, 1366 și 1920 px. Perechea 1024/1025 validează explicit tranziția drawer–sidebar fără salt paradoxal. La 320 px există o singură coloană, fără overflow orizontal sau controale inaccesibile; la desktop conținutul respectă page widths și nu se întinde excesiv. Folosește breakpoints și hook-ul responsive din temă, nu praguri locale duplicate.

Toate controalele au `accessibilityRole`, `accessibilityLabel` și `accessibilityState` potrivite, focus vizibil și target de minimum 44 × 44 px. Statusurile nu depind exclusiv de culoare; loading/error sunt anunțate semantic; dialogurile gestionează focusul și Escape; motion respectă `prefers-reduced-motion`.

## Interdicții

În pagini noi sau modificate nu sunt permise culori locale hex/rgba, radius sau shadows locale, componente UI one-off, nested `Pressable`, date inventate, navigație duplicată, controale inactive, scroll orizontal accidental sau modificarea neautorizată a logicii business.

## Validare

Din root rulează:

```powershell
npm.cmd run ui:audit
npm.cmd run ui:audit -- --strict
git diff --check
git status --short
git diff --stat
```

Din `apps/mobile` rulează:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npx.cmd --no-install expo install --check
npx.cmd expo export --platform all --output-dir .expo\rabai-signature-final
```

`ui:audit` verifică implicit toate rutele de producție și referințele interzise din sursă. Modul advisory ajută în timpul implementării; predarea folosește obligatoriu `--strict`. Excepția pentru text mic trebuie documentată pe aceeași linie sau linia precedentă cu `rabai-ui-audit: allow-small-text — motiv`.
