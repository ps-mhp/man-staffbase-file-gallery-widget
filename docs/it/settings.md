# Impostazioni

Tutte le impostazioni vengono gestite nella finestra **Seleziona file**. Questa si apre insieme alla
finestra di dialogo delle impostazioni; nella finestra stessa è presente solo il pulsante che la
riapre.

| Impostazione | Descrizione |
| --- | --- |
| Origine (elenco a sinistra) | **Tutti i file** (impostazione predefinita) mostra i file di **tutte le raccolte** che gli utenti in modalità di lettura sono autorizzati a visualizzare. I file che non fanno parte di alcuna raccolta non vengono visualizzati. Una **raccolta** dal Gestore file (Studio → File) mostra solo i file in essa contenuti. Il campo di ricerca in alto consente di cercare le raccolte in base al nome. La fonte selezionata viene visualizzata al centro come intestazione. |
| Ordinamento | Più recenti prima (impostazione predefinita), Più vecchi prima, Nome A–Z, Nome Z–A, Più grandi prima, Più piccoli prima. |
| Filtra per | Su cosa agisce il filtro: **nome file** (impostazione predefinita), **estensione file** (ad es. `pdf`) o **caricato da**. |
| Condizione | **contiene** (impostazione predefinita), **non contiene**, **inizia con**, **termina con**, **è uguale a** o **Regex** (espressione regolare). Non fa differenza tra maiuscole e minuscole. |
| Valore | Il valore della condizione. Vuoto = nessun filtro. |
| Disposizione | **Riquadri**: anteprima in alto, dettagli sotto (impostazione predefinita). **Elenco**: anteprima a sinistra, dettagli a destra. |
| Massimo | Il numero massimo di file da visualizzare. `0` (impostazione predefinita) mostra tutti. |
| Inserisci manualmente l’ID della raccolta | Necessario solo se una raccolta manca dall’elenco o se l’elenco non si carica: inserisci l’ID di 24 cifre o l’indirizzo della raccolta. Si trova sotto il modulo, nascosto. |

I passaggi vengono eseguiti in questo ordine: prima **Filtro**, poi
**Ordinamento**, poi **Massimo**. «Più recenti per primi» con valore 5 mostra quindi i cinque
file più recenti che corrispondono al filtro.

Esempi di espressioni regolari nel nome del file: `^2026-\d\d_PIM_` (inizia
con 2026, mese, `_PIM_`) oppure `Rapporto|Verbale` (uno dei due).

## Note

- Un’espressione regolare non valida non può essere applicata. La
  barra di stato in alto e il campo **Valore** indicano l’errore.
- **Applica** inserisce i dati nella finestra di dialogo delle impostazioni; il salvataggio avviene solo con
  il pulsante **Salva**.
- Desktop, tablet e dispositivi mobili visualizzano la galleria così come appare nella pagina,
  con i file effettivi della fonte. Le impostazioni si trovano a destra nelle
  schede **Filtro e ordine** e **Visualizzazione**.
- Annulla e Ripeti si trovano nella parte superiore della finestra (⌘/Ctrl Z o ⇧⌘/Ctrl Z).
- A partire da questa versione, tutte le impostazioni sono contenute in un unico campo
  (`file-gallery-config`). Le gallerie delle versioni precedenti continuano a mostrare, senza modifiche,
  ciò che mostravano in precedenza. Alla prima apertura, la finestra riprende i vecchi
  valori, purché la finestra di dialogo li riporti in modo leggibile. Nel Content Designer i
  vecchi campi di selezione (Ordinamento, Filtra per, Condizione, Disposizione) non sono
  leggibili: la finestra mostra lì l’impostazione predefinita, mentre a lato
  continua a valere il vecchio valore finché non viene modificato nella finestra.
