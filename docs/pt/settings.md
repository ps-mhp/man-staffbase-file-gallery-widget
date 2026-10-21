# Configurações

| Cenário | Descrição |
| --- | --- |
| Coleção (opcional) | A coleção do gerenciador de arquivos cujos arquivos são exibidos. Vazio = os arquivos **de todas as coleções** que os leitores podem ver. Arquivos que não estão em uma coleção não aparecerão. |
| Ordem | Mais novo primeiro (padrão), Mais velho primeiro, Nome A-Z, Nome Z-A, Maior primeiro, Menor primeiro. |
| Filtro: Campo | Sobre o que o filtro funciona: **Nome do Arquivo**, **Extensão do Arquivo** (ex.: 'pdf') ou **Enviado por**. |
| Filtro: Condição | **Contém**, **Não contém**, **Começa com**, **Termina com**, **Igual** ou **Corresponde à expressão regular**. Indistinto a maiúsculas minúsculas. |
| Filtro: Valor | O valor da condição. Em branco = sem filtro. |
| Exibição | **Caixa**: Imagem de pré-visualização no topo, detalhes abaixo (padrão). **Lista**: Imagem de pré-visualização à esquerda, detalhes à direita. |
| Mostrar no máximo | O número máximo de arquivos que aparecem. '0' (padrão) mostra todos eles. |

Os passos seguem esta ordem: primeiro **filtro**, depois **ordem**, 
então **Mostrar no máximo**. Então "O Mais Novo primeiro" com 5 mostra os cinco
Arquivos mais recentes que correspondem ao filtro. 

Exemplos de expressões regulares no nome do arquivo: '^2026-\d\d_PIM_' (starts
com o mês de 2026, '_PIM_') ou 'Relatório| Protocolo' (um dos dois).