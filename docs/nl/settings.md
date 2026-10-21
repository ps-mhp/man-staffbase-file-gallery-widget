# Instellingen

| Setting | Beschrijving |
| --- | --- |
| Collectie (optioneel) | De collectie van de bestandsbeheerder waarvan de bestanden worden weergegeven. Leeg = de bestanden **van alle collecties** die lezers mogen zien. Bestanden die niet in een collectie zitten, verschijnen niet. |
| Volgorde | Nieuwste eerst (standaard), Oudste eerst, Naam A-Z, Naam Z-A, Grootste eerst, Kleinste eerst. |
| Filter: Veld | Waar de filter op werkt: **Bestandsnaam**, **Bestandsextensie** (bijv. 'pdf') of **Geüpload door**. |
| Filter: Voorwaarde | **Bevat**, **Bevat niet**, **Begint met**, **Eindigt met**, **Gelijk aan** of **Komt overeen met reguliere expressie**. Hoofdlettergevoelig. |
| Filter: Waarde | De waarde voor de conditie. Leeg = geen filter. |
| Weergeven | **Vakken**: Afbeelding bovenaan, details hieronder (standaard). **Lijst**: Afbeelding links bekijken, details rechts. |
| Toon hooguit | Het maximale aantal bestanden dat verschijnt. '0' (standaard) toont ze allemaal. |

De stappen verlopen in deze volgorde: eerst **filter**, dan **volgorde**, 
dan **Toon hooguit**. Dus "Nieuwste eerst" met 5 toont de vijf
Laatste bestanden die overeenkomen met het filter. 

Voorbeelden van reguliere expressies in de bestandsnaam: '^2026-\d\d_PIM_' (begint
met 2026, maand, '_PIM_') of 'Rapport| Protocol' (een van de twee).