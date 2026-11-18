# Ustawienia

Wszystkie ustawienia są konfigurowane w oknie **Wybierz pliki**. Otwiera się ono wraz z
oknem dialogowym ustawień; w samym oknie dialogowym znajduje się jedynie przycisk, który ponownie je
otwiera.

| Ustawienie | Opis |
| --- | --- |
| Źródło (lista po lewej) | **Wszystkie pliki** (ustawienie domyślne) wyświetla pliki **ze wszystkich kolekcji**, do których użytkownicy mają uprawnienia do odczytu. Pliki, które nie znajdują się w żadnej kolekcji, nie są wyświetlane. **Kolekcja** z menedżera plików (Studio → Pliki) wyświetla wyłącznie swoje pliki. Pole wyszukiwania powyżej pozwala znaleźć kolekcje według nazwy. Wybrane źródło jest wyświetlane pośrodku jako nagłówek. |
| Sortowanie | Najnowsze najpierw (ustawienie domyślne), Najstarsze najpierw, Nazwa A–Z, Nazwa Z–A, Największe najpierw, Najmniejsze najpierw. |
| Filtrowanie według | Na co działa filtr: **nazwa pliku** (ustawienie domyślne), **rozszerzenie pliku** (np. `pdf`) lub **przesłane przez**. |
| Warunek | **zawiera** (ustawienie domyślne), **nie zawiera**, **zaczyna się od**, **kończy się na**, **jest równe** lub **Regex** (wyrażenie regularne). Wielkość liter nie ma znaczenia. |
| Wartość | Wartość warunku. Puste pole = brak filtru. |
| Układ | **Kafelki**: miniatura u góry, szczegóły poniżej (ustawienie domyślne). **Lista**: miniatura po lewej, szczegóły po prawej. |
| Maksymalnie | Maksymalna liczba wyświetlanych plików. `0` (ustawienie domyślne) wyświetla wszystkie. |
| Ręczne wprowadzenie identyfikatora kolekcji | Wymagane tylko wtedy, gdy na liście brakuje kolekcji lub lista się nie ładuje: wprowadź 24-cyfrowy identyfikator lub adres kolekcji. Ukryte pod formularzem. |

Kroki są wykonywane w następującej kolejności: najpierw **Filtr**, następnie
**Sortowanie**, a potem **Maksymalnie**. Opcja „Najnowsze najpierw” z wartością 5 wyświetla zatem pięć
najnowszych plików, które spełniają kryteria filtra.

Przykłady wyrażeń regularnych w nazwach plików: `^2026-\d\d_PIM_` (zaczyna się
od 2026, miesiąca, `_PIM_`) lub `Raport|Protokół` (jedno z dwóch).

## Uwagi

- Nieprawidłowego wyrażenia regularnego nie da się zastosować.
  Wiersz stanu u góry oraz pole **Wartość** wskazują błąd.
- Przycisk **Zastosuj** wprowadza zmiany do okna dialogowego ustawień; zapisywanie następuje dopiero po
  kliknięciu przycisku **Zapisz**.
- Komputer stacjonarny, tablet i urządzenie mobilne wyświetlają galerię tak, jak pokazuje ją strona,
  z rzeczywistymi plikami ze źródła. Ustawienia znajdują się po prawej stronie w
  zakładkach **Filtr i kolejność** oraz **Wyświetlanie**.
- Przyciski **Cofnij** i **Powtórz** znajdują się u góry okna (⌘/Ctrl Z lub ⇧⌘/Ctrl Z).
- Od tej wersji całe ustawienie znajduje się w jednym polu
  (`file-gallery-config`). Galerie ze starszych wersji wyświetlają bez zmian
  to, co wyświetlały dotychczas. Przy pierwszym otwarciu okno przejmuje stare
  wartości, o ile okno dialogowe pozwala na ich odczytanie. W Content Designerze
  stare pola wyboru (sortowanie, filtrowanie według, warunek, układ) nie są
  czytelne: okno wyświetla tam ustawienia domyślne, a z boku nadal obowiązuje
  stara wartość, dopóki nie zostanie zmieniona w oknie.
