---
name: "FlowPDV Master"
description: "Livro de registros: clareza, estrutura e identidade FlowPDV."
colors:
  primary: "#b94b1b"
  primary-hover: "#963a14"
  paper: "#f5f4ef"
  surface: "#ffffff"
  ink: "#222923"
  muted: "#60665f"
  line: "#dedfd6"
  tint: "#faeee5"
  positive: "#216348"
  danger: "#ad3038"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "38px"
    fontWeight: 700
  body:
    fontFamily: "Plus Jakarta Sans, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "14px"
    lineHeight: 1.6
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
---

# Design System: FlowPDV Master

## Overview

**Creative North Star: "Livro de registros"**

Uma bancada administrativa organizada como um livro de registros. A navegação grafite sustenta o contexto; o conteúdo repousa sobre papel marfim e superfícies brancas. Lojas e licenças aparecem em linhas comparáveis, com ações explícitas e estados discretos.

**Key Characteristics:**
- Navegação grafite e conteúdo claro.
- Licenças em registros comparáveis.
- Ações explícitas, códigos e valores legíveis.

Extração estática de `css/reconstruction.css` e dos estilos-base existentes em 23/09/2026. A implementação está em reconstrução. Testes completos, revisão e otimização foram adiados pelo usuário; não houve validação renderizada nesta documentação. A expressão específica da rodada está em `.impeccable/surface-brief.md`.

## Colors

### Primary
Laranja queimado conduz a ação principal e conecta a interface aos logos existentes. Seu tom pálido sinaliza seleção sem competir com o conteúdo.

### Secondary
Verde reservado a estados positivos e operacionais; vermelho comunica erro ou ação destrutiva.

### Neutral
Marfim no fundo, branco nas superfícies, grafite para leitura e cinza quente para informação secundária. Divisórias delimitam grupos sem sombras permanentes.

**The Signal Rule.** A cor deve comunicar ação, seleção ou estado; não transformar cada dado em um bloco colorido.

## Typography

A família de corpo consta no frontmatter. Plus Jakarta Sans mantém títulos, controles e dados coerentes; JetBrains Mono existente permanece disponível para códigos técnicos.
O título principal usa o papel display. Rótulos permanecem menores e firmes. Valores comparáveis usam algarismos tabulares quando disponíveis.

## Layout

Em telas amplas, a navegação fixa mede 224px; a área de trabalho usa largura máxima de 1480px e padding de 48px. A faixa de indicadores antecede filtros e lista contínua de licenças. Acima de 1500px, cada registro ganha três zonas; até 1150px, a navegação mede 190px e os registros se reorganizam. Até 760px, a navegação passa ao topo, os indicadores usam duas colunas e cada registro empilha seu conteúdo.

## Elevation & Depth

Superfícies de consulta permanecem planas. Sombras suaves se reservam a login e sobreposições; a separação cotidiana vem de bordas e tons de fundo.

## Shapes

Cantos discretamente arredondados suavizam campos e superfícies. Bordas finas e agrupamento espacial definem a estrutura. Os raios reutilizados estão no frontmatter; não aplicar o maior raio a todos os elementos.

## Components

### Buttons
Ação principal em laranja com texto branco. Secundárias usam superfície neutra e borda. Controles comuns preservam altura mínima de 44px; exceções existentes em ações auxiliares não definem o padrão. Foco visível recebe contorno laranja com afastamento. Transições de estado são discretas e respeitam movimento reduzido.

### Inputs / Fields
Campos brancos com bordas discretas e cantos de 8px. Busca e ação de nova licença usam altura de 48px. Formulários preservam labels, tipos e comportamento existente.

### Navigation
A navegação principal usa fundo grafite; o item selecionado recebe uma superfície mais clara e texto branco. Abas internas selecionadas usam laranja pálido. No celular, a navegação principal se dispõe horizontalmente no topo.

### Cards / Containers
Listas e registros devem ser fáceis de comparar. Agrupar indicadores em uma faixa e usar divisórias dentro dos conjuntos, evitando uma coleção de cartões flutuantes.

## Do's and Don'ts

### Do:
- **Do** preservar as marcas existentes e seus arquivos.
- **Do** tornar seleção, foco e ações primárias identificáveis.
- **Do** manter nomes, valores e estados vinculados aos dados reais.

### Don't:
- **Don't** alterar IDs, autenticação ou regras de negócio para obter um efeito visual.
- **Don't** usar verde como identidade dominante ou adicionar brilho decorativo.
- **Don't** considerar esta documentação evidência de validação renderizada.

