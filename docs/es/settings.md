# Escenarios

| Ambientación | Descripción |
| --- | --- |
| Colección (opcional) | La colección del gestor de archivos cuyos archivos se muestran. Vacío = los archivos **de todas las colecciones** que los lectores pueden ver. Los archivos que no estén en una colección no aparecerán. |
| Orden | Primero más nuevo (por defecto), Primero Más antiguo, Nombre A-Z, Nombre Z-A, Primero el más grande, Primero el más pequeño. |
| Filtro: Campo | En qué funciona el filtro: **Nombre del archivo**, **Extensión del archivo** (por ejemplo, 'pdf') o **Subido por**. |
| Filtro: Condición | **Contiene**, **No contiene**, **Empieza con**, **Termina con**, **Igual** o **Coincide con expresión regular**. Insensible a mayúsculas. |
| Filtro: Valor | El valor de la condición. En blanco = sin filtro. |
| Pantalla | **Recuadro**: Imagen de vista previa en la parte superior, detalles abajo (por defecto). **Lista**: Imagen de vista previa a la izquierda, detalles a la derecha. |
| Mostrar como máximo | El número máximo de archivos que aparecen. '0' (por defecto) muestra todos. |

Los pasos se ejecutan en este orden: primero **filtro**, luego **orden**, 
entonces **Show como mucho**. Así que "Más nuevo primero" con 5 muestra los cinco
Archivos más recientes que coinciden con el filtro. 

Ejemplos de expresiones regulares en el nombre del archivo: '^2026-\d\d_PIM_' (inicios
con el mes de 2026, '_PIM_') o 'Informe| Protocolo' (uno de los dos).