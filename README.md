# file-gallery-widget

Staffbase-Custom-Widget. Entwickelt, gebaut und released wird es aus dem
Meta-Repo [`ps-mhp/man-staffbase-cms-extensions`](https://github.com/ps-mhp/man-staffbase-cms-extensions);
dieses Repo enthält nur Quellcode und das ausgelieferte Bundle unter `dist/`.

```bash
scripts/sync.sh file-gallery-widget
npm run build -- --env widget=file-gallery-widget
npm test -- src/widgets/file-gallery-widget
scripts/release.sh file-gallery-widget
```
