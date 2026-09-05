# Raízes do Nordeste — Sistema de Pedidos Multicanal (Front-end)

Protótipo de front-end para o sistema de pedidos da rede de lanchonetes **Raízes do Nordeste**, cobrindo os canais **App**, **Totem** e **Web** a partir de uma única base de código em **HTML, CSS e JavaScript puro** (sem frameworks e sem bibliotecas externas).

Este repositório contém apenas a camada de interface. Não há backend real: todos os dados (unidades, cardápio, usuários, promoções e fidelidade) são mockados em arquivos JSON na pasta `data/`, e o fluxo de pagamento é simulado (sem processar transações reais).

## Como executar localmente

Como o projeto usa `fetch()` para carregar os arquivos JSON de `data/`, ele precisa ser servido por um servidor HTTP local (abrir o `index.html`
diretamente pelo navegador, via `file://`, bloqueia essas requisições por política de CORS do próprio navegador).

Qualquer servidor estático simples resolve. Exemplos:

```bash

# Opção 1: Extensão "Live Server" do VS Code (Recomendado)
Basta clicar em "Go Live" na barra inferior do VS Code.

# Opção 2: Python
python3 -m http.server 8080

# Opção 3: Node.js
npx http-server -p 8080
```

Depois, acesse `http://localhost:8080` no navegador.

Para simular o canal **Totem**, acesse a URL:

```
http://localhost:8080/?canal=totem
```

## Estrutura de pastas

```
index.html                  Página única da aplicação (SPA)
styles/
  tokens.css                Variáveis de tema (cores, espaçamento, raios)
  reset.css                 Reset mínimo entre navegadores
  main.css                  Layout mobile-first, grid e breakpoints
  components.css            Estilo dos componentes (navbar, cartões, modal...)
scripts/
  app.js                    Roteador da SPA (hash routing) e inicialização
  state.js                  Estado global (sessão, carrinho, LGPD, canal)
  data.js                   Camada de acesso aos dados mockados (data/*.json)
  components/               Componentes reutilizáveis entre telas
    navbar.js
    modal.js
    lgpdBanner.js
    productCard.js
    loyaltyBadge.js
  views/                    Uma "tela" por arquivo
    boasVindas.js
    login.js
    cardapio.js
    itemDetalhe.js
    carrinho.js
    checkout.js
    processandoPagamento.js
    confirmacaoPagamento.js
    statusPedido.js
    fidelidade.js
    promocoes.js
data/
  unidades.json
  cardapio.json
  usuarios.json
  promocoes.json
  fidelidade.json
```

## Decisões técnicas

- **SPA com roteador em hash (`#/rota`)**: uma única página (`index.html`)
  troca o conteúdo de `<main id="app">` conforme a URL muda. Cada tela é
  uma função de renderização independente em `scripts/views/`, o que
  mantém o código organizado sem exigir nenhum framework ou processo de
  build.
- **ES Modules nativos do navegador**: os arquivos `.js` são carregados
  com `<script type="module">` e se importam entre si com `import`/`export`
  padrão do JavaScript — não é um framework, é um recurso nativo da
  linguagem.
- **Uma base de código para os 3 canais**: o parâmetro de URL
  `?canal=totem` ativa `data-canal="totem"` no `<body>`, que:
  - amplia botões e áreas de toque (CSS);
  - mostra avisos de "modo convidado" nas telas de boas-vindas, cardápio,
    carrinho e checkout;
  - define dinheiro como forma de pagamento padrão (pagamento presencial
    confirmado pelo atendente).
- **Temas por perfil**: `data-theme="cliente"` (claro, vermelho/branco,
  verde para estados de sucesso) e `data-theme="admin"` (escuro, azul).
  As variáveis de cor já estão organizadas em `styles/tokens.css` para
  permitir, no futuro, alternância entre modo claro/escuro dentro de cada
  tema.
- **Estado e persistência**: `scripts/state.js` centraliza sessão,
  carrinho, unidade selecionada e consentimento LGPD, persistindo tudo em
  `localStorage` para simular uma sessão de usuário sem servidor.
- **Dados mockados**: `scripts/data.js` isola todo o acesso aos arquivos
  JSON. Se um backend real for integrado no futuro, apenas esse arquivo
  precisa mudar — as telas continuam iguais.
- **Pagamento simulado**: a tela de processamento usa `setTimeout` para
  imitar o tempo de resposta de um sistema de pagamento externo, e sorteia
  entre sucesso e falha apenas para permitir demonstrar os dois desfechos
  (aprovado / recusado). Nenhum dado de cartão é coletado ou armazenado.
- **Status do pedido em tempo real (simulado)**: a tela de status usa
  `setInterval` para avançar as etapas do pedido automaticamente, no lugar
  de uma conexão real com a cozinha/backend.

## Conformidade com a LGPD

| Ponto | Onde está na interface |
|---|---|
| Aviso de cookies (primeira visita) | Banner fixo inferior, `scripts/components/lgpdBanner.js` |
| Consentimento explícito no cadastro | Modal obrigatório antes de criar conta, `scripts/views/login.js` |
| Finalidade declarada dos dados | Texto explicativo no modal de consentimento |
| Minimização de dados | Cadastro pede apenas nome, e-mail, telefone e senha |
| Dados de pagamento não armazenados | Tela de checkout não coleta nem salva número de cartão |

## Status do projeto

Fase 4 — Desenvolvimento da Interface (fluxo completo do **Cliente**). O Painel Administrativo e a integração entre fluxos (Fase 5) ainda não foram desenvolvidos.
