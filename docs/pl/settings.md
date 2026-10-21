# Ustawienia

| Miejsce akcji | Opis |
| --- | --- |
| Kolekcja (opcjonalna) | Kolekcja z menedżera plików, której pliki są wyświetlane. Pusty = pliki **wszystkich kolekcj**, które czytelnicy mogą zobaczyć. Pliki, które nie znajdują się w kolekcji, nie pojawią się. |
| Kolejność | Najnowszy najpierw (domyślnie), Najstarszy pierwszy, Nazwa A-Z, Nazwa Z-A, Największy pierwszy, Najmniejszy pierwszy. |
| Filtr: Pole | Na czym działa filtr: **Nazwa pliku**, **Rozszerzenie pliku** (np. 'pdf') lub **Przesłane przez**. |
| Filtr: Warunek | **Zawiera**, **Nie zawiera**, **Zaczyna się na**, **Kończy się na**, **Równa się** lub **Odpowiada wyrażeniu regularnem**. Nierozróżniające wielka a niewielka litera. |
| Filtr: Wartość | Wartość warunku. Pusty = brak filtra. |
| Wyświetlacz | **Ramka**: Obraz podglądowy na górze, szczegóły poniżej (domyślnie). **Lista**: Obraz podglądowy po lewej, szczegóły po prawej. |
| pokaż maksymalnie | Maksymalna liczba plików, które się pojawiają. '0' (domyślnie) pokazuje wszystkie pliki. |

Kroki przebiegają w następującej kolejności: najpierw **filtrować**, potem **kolejność**, 
potem **Pokaz najwyżej**. Więc "Najnowsze pierwsze" z 5 pokazuje pięć
najnowsze pliki pasujące do filtra. 

Przykłady wyrażeń regularnych w nazwie pliku: '^2026-\d\d_PIM_' (zaczyna się
z 2026 miesiącem, '_PIM_') lub 'Raport| Protokół' (jeden z tych dwóch).