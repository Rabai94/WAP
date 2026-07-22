# RabAI Design DNA

Acest document este sursa oficiala pentru toate deciziile de design ale RabAI. El defineste directia vizuala, principiile de interactiune, comportamentul animatiilor si regulile de coerenta pentru experienta de produs.

Documentul trebuie tratat ca un sistem viu: fiecare decizie majora de design trebuie sa fie aliniata cu aceste principii sau sa propuna o actualizare explicita a lor.

## RabAI Signature in produs

Acest document pastreaza intentia de brand. Contractul executabil pentru UI de produs este `docs/rabai-design-system.md`; acesta prevaleaza pentru tokeni, shell, navigatie, tipografie, liste, carduri si responsive. RabAI Signature urmareste un instrument matur si calm: shell charcoal, canvas warm ivory, accent matte gold rar, liste inaintea cardurilor si fara spectacol tehnologic.

## 1. Vision

### Intentie

RabAI trebuie sa se simta ca un companion inteligent, calm si precis, capabil sa transforme complexitatea in claritate. Experienta vizuala trebuie sa transmita incredere, rafinament tehnologic si un sentiment de progres continuu.

### Directie

Designul RabAI trebuie sa evite zgomotul vizual si dramatizarea inutila. Interfata trebuie sa para vie, dar controlata; avansata, dar accesibila; memorabila, dar functionala.

### TODO

- TODO: Defineste declaratia scurta de viziune RabAI in maximum doua propozitii.
- TODO: Stabileste cele trei atribute emotionale principale ale brandului.
- TODO: Adauga exemple de experiente digitale care se apropie de senzatia dorita.

## 2. Brand Philosophy

### Esenta brandului

RabAI exista pentru a face inteligenta artificiala mai utila, mai clara si mai apropiata de felul in care oamenii gandesc si lucreaza. Brandul trebuie sa sustina ideea de inteligenta aplicata, nu de spectacol tehnologic.

### Personalitate

RabAI comunica prin siguranta, luciditate si prezenta. Tonul vizual trebuie sa fie profesionist, dar nu rece; sofisticat, dar nu exclusivist; tehnologic, dar nu impersonal.

### Promisiune

Fiecare interactiune trebuie sa lase utilizatorul cu senzatia ca intelege mai bine ce are de facut si ca are un sistem de incredere langa el.

### TODO

- TODO: Documenteaza promisiunea principala a brandului.
- TODO: Defineste ce nu este RabAI din perspectiva de brand.
- TODO: Stabileste reguli pentru tonul vizual in materiale comerciale si produs.

## 3. Design Principles

### Claritate inainte de expresie

Elementele vizuale trebuie sa ajute utilizatorul sa inteleaga, sa decida si sa actioneze. Expresivitatea este valoroasa doar atunci cand sustine claritatea.

### Inteligenta vizibila discret

RabAI trebuie sa sugereze inteligenta prin ritm, ordine, lumina, micro-interactiuni si structura, nu prin aglomerare de simboluri futuriste.

### Continuitate

Experienta trebuie sa para conectata de la un ecran la altul. Culorile, miscarile, iconografia, spatierea si densitatea informatiilor trebuie sa formeze un sistem coerent.

### Control si calm

Interfata nu trebuie sa concureze cu continutul utilizatorului. Designul sustine concentrarea, reduce frictiunea si semnaleaza schimbarile intr-un mod previzibil.

### TODO

- TODO: Valideaza principiile cu exemple concrete din produs.
- TODO: Creeaza o lista de decizii permise si nepermise pentru fiecare principiu.
- TODO: Defineste un proces de evaluare pentru noile propuneri vizuale.

## 4. Visual Language

### Directie vizuala

Limbajul vizual RabAI combina suprafete calde, neutre, ierarhie tipografica si semnale functionale discrete. El sugereaza precizie prin ordine si ritm, nu prin decor AI generic, wallpaper sau straturi concurente.

### Forme

Formele trebuie sa fie simple, echilibrate si precise. Geometria poate fi usor tehnica, dar nu agresiva. Marginile, gridurile si proportiile trebuie sa sustina o senzatie de ordine.

### Profunzime

Profunzimea trebuie folosita pentru ierarhie si orientare, nu ca decor. Umbrele si suprapunerile trebuie sa fie rare, subtile si justificate de un nivel real.

### TODO

- TODO: Stabileste un moodboard oficial pentru limbajul vizual RabAI.
- TODO: Defineste regulile pentru forme, raze, spatiere si densitate.
- TODO: Creeaza exemple de aplicare pentru produs, website si materiale de brand.

## 5. Color System

### Rolul culorii

Culoarea trebuie sa semnaleze ierarhie, stare, interactiune si identitate. Sistemul cromatic trebuie sa fie suficient de distinct pentru brand, dar suficient de functional pentru interfete dense.

### Paleta primara adoptata

RabAI Signature foloseste charcoal `#101214` pentru shell, warm ivory `#F4F0E7` pentru canvas, ink `#191A1C` pentru text si matte gold `#A98538` pentru CTA-ul primar. Gold ramane rar: nu coloreaza fiecare border sau titlu si nu semnalizeaza warning, succes, eroare ori actiuni destructive.

### Paleta secundara adoptata

Suprafetele folosesc `#FAF7F0` si `#EDE7DB`, borderul de baza este `#D8D1C4`, iar textul secundar foloseste griuri calde. Valorile executabile si rolurile complete sunt definite exclusiv in `apps/mobile/src/theme/colors.ts` si documentate in `docs/rabai-design-system.md`.

### Stari functionale

Succesul, avertizarea, eroarea, informarea si starea neutra trebuie sa aiba culori clare, consecvente si testate pentru contrast.

### Contract de produs

UI-ul operational este list-first, nu card-first; nu permite card in card, mai mult de un CTA primar intr-un grup, navigatie duplicata, text sub 13 px sau o mascota/bula plutitoare peste continut. Design Lab si tokenii experimentali au fost eliminati din arborele de productie. Orice explorare aprobata intra in produs numai prin tema semantica si primitivele globale.

## 6. Motion Principles

### Scopul miscarii

Miscarea trebuie sa explice schimbarea, sa confirme actiunea si sa creeze continuitate. Animatiile nu trebuie sa existe doar pentru impresie vizuala.

### Ritm

Ritmul animatiilor trebuie sa fie calm, fluent si rapid enough pentru a nu incetini utilizatorul. Tranzitiile trebuie sa fie previzibile si sa respecte importanta actiunii.

### Personalitate

Motion design-ul RabAI trebuie sa sugereze procesare inteligenta, nu instabilitate. Miscarile pot fi organice, dar trebuie sa ramana precise.

### TODO

- TODO: Defineste duratele standard pentru micro-interactiuni, tranzitii si animatii de stare.
- TODO: Stabileste curbele de easing oficiale.
- TODO: Creeaza exemple pentru loading, confirmare, eroare si navigare.

## 7. Lighting Rules

### Rolul luminii

Lumina trebuie sa creeze focus, profunzime si atmosfera. Ea trebuie sa sustina senzatia de tehnologie rafinata, fara sa reduca lizibilitatea.

### Directie

Accentele trebuie sa ghideze privirea fara glow sau efecte spectaculoase. In UI operational, claritatea si contrastul au prioritate fata de atmosfera.

### Restrictii

Glow-ul, highlight-ul decorativ si reflexiile nu fac parte din UI-ul operational. Niciun efect vizual nu ascunde continutul, oboseste privirea sau creeaza contraste necontrolate.

### TODO

- TODO: Defineste regulile pentru glow, umbre si highlight-uri.
- TODO: Stabileste intensitati maxime pentru lumina in UI.
- TODO: Creeaza exemple acceptate si respinse pentru fundaluri luminoase.

## 8. Particle System

### Scop

Particulele trebuie sa sugereze date, activitate, conexiuni sau procese inteligente. Ele nu trebuie sa devina zgomot vizual si nu trebuie sa distraga de la actiunea principala.

### Comportament

Particulele trebuie sa se miste coerent, cu densitate controlata si cu relatii clare fata de continut. Sistemul poate include aparitii, disparitii, pulsuri si conectari subtile.

### Context

Particulele nu sunt un pattern pentru interfetele operationale RabAI. Ele pot fi evaluate separat numai pentru un moment de brand aprobat, fara a concura cu continutul sau accesibilitatea.

### TODO

- TODO: Defineste densitatea maxima a particulelor pe ecran.
- TODO: Stabileste comportamente pentru idle, processing si success.
- TODO: Documenteaza cand particulele sunt interzise in produs.

## 9. Lines and Connections

### Rol

Liniile si conexiunile trebuie sa comunice relatii, fluxuri, dependinte si structuri inteligente. Ele pot sustine ideea de retea, analiza sau orchestrare.

### Stil

Liniile trebuie sa fie fine, precise si bine integrate in layout. Conexiunile pot avea animatii subtile, dar trebuie sa ramana lizibile si sa nu creeze complexitate falsa.

### Ierarhie

Grosimea, opacitatea, culoarea si miscarea liniilor trebuie sa indice importanta relatiei. Conexiunile secundare trebuie sa ramana discrete.

### TODO

- TODO: Defineste grosimi standard pentru linii statice si active.
- TODO: Stabileste reguli pentru conexiuni animate.
- TODO: Creeaza exemple pentru diagrame, fundaluri si componente UI.

## 10. UI Philosophy

### Principiu central

Interfata RabAI trebuie sa fie un instrument de lucru, nu o vitrina. Utilizatorul trebuie sa poata intelege rapid starea sistemului, urmatoarea actiune si rezultatul interactiunii.

### Densitate

UI-ul trebuie sa echilibreze spatiul liber cu eficienta. Zonele operationale pot fi mai dense, dar trebuie sa ramana scanabile si clare.

### Feedback

Fiecare actiune importanta trebuie sa aiba feedback vizual. Feedback-ul trebuie sa fie imediat, calm si proportional cu importanta evenimentului.

### Componente

Componentele trebuie sa fie consecvente, reutilizabile si usor de extins. Variatiile trebuie documentate pentru a evita fragmentarea sistemului.

### TODO

- TODO: Defineste principiile pentru navigatie, formulare, tabele si panouri.
- TODO: Creeaza reguli pentru stari goale, loading, error si success.
- TODO: Documenteaza densitatea recomandata pentru ecrane de produs.

## 11. Iconography

### Stil

Iconografia RabAI trebuie sa fie simpla, clara si aliniata cu limbajul vizual al interfetei. Iconitele trebuie sa fie functionale inainte de a fi decorative.

### Consistenta

Setul de iconite trebuie sa foloseasca aceeasi grosime a liniei, aceeasi logica de colturi si aceeasi densitate vizuala. Diferentele stilistice trebuie evitate.

### Utilizare

Iconitele trebuie folosite pentru a creste viteza de recunoastere a actiunilor si starilor. Ele trebuie insotite de text acolo unde sensul nu este evident.

### TODO

- TODO: Alege biblioteca sau stilul oficial de iconografie.
- TODO: Defineste dimensiunile standard pentru iconite.
- TODO: Creeaza reguli pentru iconite active, inactive, disabled si destructive.

## 12. Typography

### Rol

Tipografia trebuie sa sustina claritatea, ierarhia si increderea. Textul trebuie sa fie usor de scanat si sa nu creeze frictiune in interactiunile frecvente.

### Ierarhie

Sistemul tipografic trebuie sa defineasca niveluri clare pentru titluri, subtitluri, corp de text, etichete, valori, mesaje de stare si microcopy.

### Ton

Tipografia trebuie sa para moderna si profesionala. Greutatile, dimensiunile si spatierea trebuie sa sustina precizia, nu teatralitatea.

### TODO

- TODO: Alege familia tipografica principala si alternativele de fallback.
- TODO: Defineste scala tipografica pentru produs si materiale de brand.
- TODO: Stabileste reguli pentru lungimea randurilor, spatiere si contrast.

## 13. Accessibility

### Principiu

Accesibilitatea este o cerinta de baza a designului RabAI, nu o etapa de final. Fiecare componenta trebuie sa fie utilizabila, lizibila si inteligibila pentru cat mai multi utilizatori.

### Contrast si lizibilitate

Textul, iconitele, graficele si starile interactive trebuie sa respecte standarde clare de contrast. Informatiile importante nu trebuie comunicate doar prin culoare.

### Interactiune

Elementele interactive trebuie sa aiba dimensiuni adecvate, focus vizibil, stari clare si comportament previzibil pentru tastatura si tehnologii asistive.

### Motion si confort

Animatiile trebuie sa poata fi reduse sau dezactivate pentru utilizatorii sensibili la miscare. Efectele vizuale intense trebuie evitate in fluxurile esentiale.

### TODO

- TODO: Stabileste nivelul WCAG tinta pentru produs.
- TODO: Defineste criterii de contrast pentru toate paletele.
- TODO: Creeaza checklist de accesibilitate pentru componente noi.
- TODO: Documenteaza reguli pentru reduced motion.

## 14. Future Animation System

### Directie

Sistemul viitor de animatie RabAI trebuie sa fie modular, coerent si usor de aplicat in produs. El trebuie sa includa reguli pentru tranzitii, micro-interactiuni, feedback, fundaluri dinamice si momente de brand.

### Arhitectura

Animatiile trebuie gandite ca un limbaj comun, nu ca efecte separate. Fiecare categorie de miscare trebuie sa aiba scop, durata, easing, intensitate si context de utilizare.

### Extensibilitate

Sistemul trebuie sa permita adaugarea de noi patternuri fara a rupe coerenta existenta. Noile animatii trebuie evaluate prin prisma performantei, accesibilitatii si claritatii.

### TODO

- TODO: Defineste taxonomia animatiilor RabAI.
- TODO: Creeaza o biblioteca de patternuri motion.
- TODO: Stabileste reguli de performanta pentru animatii web si mobile.
- TODO: Documenteaza procesul de aprobare pentru animatii noi.

## Governance

### Rolul documentului

Acest document trebuie consultat inaintea oricarei decizii majore privind interfata, identitatea vizuala, animatiile, ilustratiile, iconografia sau materialele de comunicare RabAI.

### Actualizare

Orice modificare a directiei de design trebuie documentata aici, impreuna cu motivatia schimbarii si impactul asupra produsului.

RabAI Signature este directia activa pentru web, Android si iOS. Schimbarile de produs se verifica prin contractul UI, checklistul de pagina si auditul strict; nu se reintroduc sisteme navy/albastre, card-first sau preview-uri Design Lab paralele.

### TODO

- TODO: Stabileste ownerul documentului.
- TODO: Defineste frecventa de revizuire.
- TODO: Creeaza un proces pentru propuneri, validare si adoptare.
