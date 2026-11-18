# Instellingen

Alles wordt beheerd in het venster **Bestanden selecteren**. Dit venster wordt geopend via het
instellingenvenster; in het venster zelf staat alleen de knop waarmee je het opnieuw
kunt openen.

| Instelling | Beschrijving |
| --- | --- |
| Bron (lijst links) | **Alle bestanden** (standaardinstelling) toont de bestanden van **alle verzamelingen** die de lezer mag zien. Bestanden die in geen enkele verzameling zitten, worden dan niet weergegeven. Een **verzameling** uit de bestandsbeheerder (Studio → Bestanden) toont alleen de bestanden daarvan. Het zoekveld erboven zoekt verzamelingen op naam. De geselecteerde bron staat in het midden als koptekst. |
| Sortering | Nieuwste eerst (standaard), Oudste eerst, Naam A–Z, Naam Z–A, Grootste eerst, Kleinste eerst. |
| Filteren op | Waarop de filter van toepassing is: **bestandsnaam** (standaard), **bestandsextensie** (bijv. `pdf`) of **geüpload door**. |
| Voorwaarde | **bevat** (standaard), **bevat niet**, **begint met**, **eindigt op**, **is gelijk aan** of **Regex** (reguliere expressie). Hoofdletters en kleine letters maken geen verschil. |
| Waarde | De waarde voor de voorwaarde. Leeg = geen filter. |
| Indeling | **Tegels**: miniatuurafbeelding bovenaan, details daaronder (standaard). **Lijst**: miniatuurafbeelding links, details rechts. |
| Maximaal | Hoeveel bestanden er maximaal worden weergegeven. `0` (standaard) toont alles. |
| Collectie-ID handmatig invoeren | Alleen nodig als een collectie in de lijst ontbreekt of de lijst niet laadt: voer de 24-cijferige ID of het adres van de collectie in. Ingeklapt onder het formulier. |

De stappen worden in deze volgorde uitgevoerd: eerst **Filter**, dan
**Sortering**, dan **Maximaal**. „Nieuwste eerst“ met 5 toont dus de vijf
nieuwste bestanden die aan het filter voldoen.

Voorbeelden van reguliere expressies in bestandsnamen: `^2026-\d\d_PIM_` (begint
met 2026, maand, `_PIM_`) of `Bericht|Protocol` (een van beide).

## Opmerkingen

- Een ongeldige reguliere uitdrukking kan niet worden toegepast. De
  statusbalk bovenaan en het veld **Waarde** geven de fout aan.
- **Toepassen** vult de instellingen in het dialoogvenster in; het wordt pas opgeslagen met
  de knop **Opslaan**.
- Op desktop, tablet en mobiel wordt de galerij weergegeven zoals op de pagina,
  met de daadwerkelijke bestanden uit de bron. De instellingen staan daar rechts in
  de tabbladen **Filter & Volgorde** en **Weergave**.
- Ongedaan maken en Opnieuw staan bovenaan in het venster (⌘/Ctrl Z resp. ⇧⌘/Ctrl Z).
- Vanaf deze versie staan alle instellingen in één veld
  (`file-gallery-config`). Galerijen uit oudere versies blijven ongewijzigd weergeven
  wat ze tot nu toe lieten zien. Bij de eerste keer openen neemt het venster de oude
  waarden over, voor zover het dialoogvenster deze leesbaar weergeeft. In de Content Designer zijn de
  oude selectievelden (Sorteren, Filteren op, Voorwaarde, Indeling) niet
  leesbaar: het venster toont daar de standaardinstelling, en aan de zijkant blijft
  de oude waarde van kracht totdat deze in het venster wordt gewijzigd.
