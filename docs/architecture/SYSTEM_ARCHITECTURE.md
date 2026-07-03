# WAP System Architecture

## 1. Scopul arhitecturii

WAP trebuie construit ca o platformă modulară, extensibilă și sigură.

Scopul arhitecturii este ca platforma să poată crește de la o aplicație simplă pentru muncă legală flexibilă la un ecosistem complet pentru muncitori, companii, clienți, parteneri și instituții.

## 2. Principiul central

WAP nu este construit ca o aplicație simplă de joburi.

WAP este construit ca o platformă de conectare.

Platforma trebuie să poată conecta:

- muncitori cu companii;
- clienți cu prestatori;
- companii cu alte companii;
- utilizatori cu parteneri;
- firme cu servicii administrative;
- instituții cu firme verificate.

## 3. Regula de arhitectură

Nucleul WAP trebuie să rămână stabil.
Modulele noi trebuie adăugate fără să distrugă nucleul platformei.
# 4. Nucleul WAP (Core)

Toate funcțiile platformei pornesc dintr-un singur nucleu.

Core-ul NU cunoaște modulele.

Core-ul știe doar existența utilizatorilor și regulile de bază.

## Entități principale

- User
- Profile
- Company
- Organization
- Role
- Permission
- Document
- Address
- Notification
- Audit Log

Orice modul nou trebuie să folosească aceste entități fără să le modifice fundamental.
# 5. Filosofia WAP

## Un utilizator = un singur cont

Un utilizator nu trebuie să își creeze mai multe conturi.

Același cont poate avea unul sau mai multe roluri.

Exemple:

- Worker
- Company Owner
- Consumer
- Partner
- Accountant
- Lawyer
- Institution
- Admin

Rolurile pot fi adăugate sau eliminate fără crearea unui cont nou.

Exemplu:

Sorin își creează cont ca Worker.

Peste doi ani deschide o firmă.

Același cont primește și rolul Company Owner.

Mai târziu devine și Partner.

Contul rămâne același.
# 6. Modulele WAP

Platforma este împărțită în module independente.

Fiecare modul poate fi dezvoltat fără să afecteze celelalte module.

## Module MVP

- Authentication
- Users
- Profiles
- Companies
- Jobs
- Applications
- Contracts
- Messages
- Notifications

## Module Phase 2

- AI Concierge
- Reviews
- Timesheets
- Payments
- Equipment Marketplace
- Services

## Module Phase 3

- Banking Hub
- Insurance Hub
- Courses
- Accountants
- Lawyers
- B2B Marketplace
- Logistics
- Public Projects

## Module Future

- Transport
- Food Delivery
- Freight
- International Marketplace
# 7. Entitățile fundamentale

WAP este construit în jurul unor entități principale.

Aceste entități reprezintă "obiectele" de bază ale platformei.

## Entități

- User
- Profile
- Company
- Organization
- Role
- Permission
- Job
- Contract
- Application
- Service
- Marketplace Item
- Conversation
- Message
- Notification
- Payment
- Review
- Document
- Address
- Audit Log

Orice funcție nouă trebuie să utilizeze aceste entități 
înainte de a crea unele noi.
# 8. Regulile de Aur ale WAP

## Regula 1

Orice funcție nouă trebuie să poată fi eliminată fără să afecteze nucleul platformei.

## Regula 2

Un utilizator are un singur cont pe viață.

Rolurile se adaugă contului.

Nu se creează conturi noi.

## Regula 3

Orice acțiune importantă trebuie să poată fi urmărită prin Audit Log.

## Regula 4

Nicio informație nu trebuie duplicată dacă poate fi reutilizată.

## Regula 5

Orice modul trebuie să comunice cu restul platformei prin Core.

Nu direct între module.

## Regula 6

Platforma trebuie să poată funcționa și dacă un modul este dezactivat.

## Regula 7

Experiența utilizatorului este mai importantă decât complexitatea internă.