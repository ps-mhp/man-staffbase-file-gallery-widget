# Configuración

Todo se gestiona en la ventana **Seleccionar archivos**. Se abre junto con el
cuadro de diálogo de configuración; en el propio cuadro de diálogo solo aparece el botón que permite volver a
abrirlo.

| Configuración | Descripción |
| --- | --- |
| Fuente (lista de la izquierda) | **Todos los archivos** (configuración predeterminada) muestra los archivos de **todas las colecciones** a los que los usuarios con permisos de lectura tienen acceso. Los archivos que no se encuentran en ninguna colección no aparecen. Una **colección** del gestor de archivos (Studio → Archivos) solo muestra sus archivos. El campo de búsqueda situado encima busca colecciones por nombre. La fuente seleccionada aparece en el centro como título. |
| Ordenación | Más recientes primero (predeterminado), Más antiguos primero, Nombre de la A a la Z, Nombre de la Z a la A, Más grandes primero, Más pequeños primero. |
| Filtrar por | Sobre qué actúa el filtro: **nombre de archivo** (predeterminado), **extensión de archivo** (p. ej., `pdf`) o **subido por**. |
| Condición | **contiene** (predeterminado), **no contiene**, **empieza por**, **termina en**, **es igual a** o **Regex** (expresión regular). No se distingue entre mayúsculas y minúsculas. |
| Valor | El valor de la condición. En blanco = sin filtro. |
| Disposición | **Mosaicos**: vista previa arriba, detalles debajo (por defecto). **Lista**: vista previa a la izquierda, detalles a la derecha. |
| Máximo | Número máximo de archivos que se muestran. `0` (valor predeterminado) muestra todos. |
| Introducir manualmente el ID de la colección | Solo es necesario si falta una colección en la lista o si la lista no se carga: introduce el ID de 24 dígitos o la dirección de la colección. Se encuentra oculto debajo del formulario. |

Los pasos se ejecutan en este orden: primero **Filtro**, luego
**Orden** y, por último, **Máximo**. Por lo tanto, «Más recientes primero» con el valor 5 muestra los cinco
archivos más recientes que se ajustan al filtro.

Ejemplos de expresiones regulares en el nombre del archivo: `^2026-\d\d_PIM_` (comienza
por 2026, mes, `_PIM_`) o `Informe|Acta` (cualquiera de los dos).

## Notas

- No se puede aplicar una expresión regular no válida. La
  barra de estado de la parte superior y el campo **Valor** indican el error.
- **Aplicar** introduce los cambios en el cuadro de diálogo de configuración; estos solo se guardan al
  pulsar **Guardar** en dicho cuadro de diálogo.
- El ordenador, la tableta y el móvil muestran la galería tal y como la muestra la página,
  con los archivos reales de la fuente. La configuración se encuentra a la derecha, en
  las pestañas **Filtro y orden** y **Presentación**.
- Las opciones **Deshacer** y **Rehacer** se encuentran en la parte superior de la ventana (⌘/Ctrl Z y ⇧⌘/Ctrl Z, respectivamente).
- A partir de esta versión, toda la configuración se encuentra en un único campo
  (`file-gallery-config`). Las galerías de versiones anteriores se muestran sin cambios,
  tal y como se mostraban hasta ahora. Al abrirla por primera vez, la ventana adopta los antiguos
  valores, siempre que el cuadro de diálogo los muestre de forma legible. En el Content Designer, los
  antiguos campos de selección (Ordenar, Filtrar por, Condición, Disposición) no
  se pueden leer: la ventana muestra allí la configuración predeterminada, y en el lateral sigue
  vigente el valor anterior hasta que se modifique en la ventana.
