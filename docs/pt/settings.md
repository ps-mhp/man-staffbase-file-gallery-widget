# Configurações

Tudo é gerido na janela **Selecionar ficheiros**. Esta abre-se com a
caixa de diálogo de configurações; na própria caixa de diálogo, existe apenas o botão que a
reabre.

| Configuração | Descrição |
| --- | --- |
| Origem (lista à esquerda) | **Todos os ficheiros** (predefinição) mostra os ficheiros de **todas as coleções** que os utilizadores com permissão de leitura podem ver. Os ficheiros que não se encontram em nenhuma coleção não são apresentados. Uma **coleção** do Gestor de ficheiros (Studio → Ficheiros) mostra apenas os ficheiros dessa coleção. O campo de pesquisa acima permite procurar coleções pelo nome. A fonte selecionada aparece no centro como título. |
| Ordenação | Mais recentes primeiro (predefinição), Mais antigos primeiro, Nome A–Z, Nome Z–A, Maiores primeiro, Menores primeiro. |
| Filtrar por | O que o filtro aplica: **Nome do ficheiro** (predefinição), **Extensão do ficheiro** (por exemplo, `pdf`) ou **Carregado por**. |
| Condição | **contém** (predefinição), **não contém**, **começa por**, **termina em**, **é igual a** ou **Regex** (expressão regular). Não se distingue entre maiúsculas e minúsculas. |
| Valor | O valor da condição. Em branco = sem filtro. |
| Disposição | **Mosaicos**: pré-visualização em cima, detalhes por baixo (predefinição). **Lista**: pré-visualização à esquerda, detalhes à direita. |
| Máximo | Quantos ficheiros, no máximo, são apresentados. `0` (predefinição) mostra todos. |
| Introduzir manualmente o ID da coleção | Apenas necessário se faltar uma coleção na lista ou se a lista não carregar: introduza o ID de 24 dígitos ou o endereço da coleção. Está oculto por baixo do formulário. |

Os passos são executados nesta ordem: primeiro **Filtro**, depois
**Ordenação**, depois **Máximo**. Assim, «Mais recentes primeiro» com o valor 5 mostra os cinco
ficheiros mais recentes que correspondem ao filtro.

Exemplos de expressões regulares no nome do ficheiro: `^2026-\d\d_PIM_` (começa
por 2026, mês, `_PIM_`) ou `Relatório|Protocolo` (qualquer um dos dois).

## Notas

- Uma expressão regular inválida não pode ser aplicada. A
  barra de estado na parte superior e o campo **Valor** indicam o erro.
- **Aplicar** insere os dados na caixa de diálogo de configurações; só fica guardado quando se clica em
  **Guardar**.
- O computador, o tablet e o telemóvel apresentam a galeria tal como a página a mostra,
  com os ficheiros reais da fonte. As definições encontram-se à direita, nos
  separadores **Filtro e ordem** e **Apresentação**.
- As opções **Reverter** e **Repetir** encontram-se na parte superior da janela (⌘/Ctrl Z ou ⇧⌘/Ctrl Z).
- A partir desta versão, toda a configuração está num único campo
  (`file-gallery-config`). As galerias de versões anteriores continuam a apresentar, sem alterações,
  o que apresentavam até agora. Ao abrir pela primeira vez, a janela assume os valores antigos,
  na medida em que a caixa de diálogo os apresente de forma legível. No Content Designer, os
  antigos campos de seleção (Ordenação, Filtrar por, Condição, Disposição) não são
  legíveis: a janela apresenta aí a predefinição e, na lateral,
  o valor antigo continua a ser válido até ser alterado na janela.
