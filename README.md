# 🎨 Excalidraw (Desenho)

> **Whiteboard virtual minimalista, colaborativo e auto-hospedado para ideação ágil e diagramação de arquitetura.**

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![Excalidraw](https://img.shields.io/badge/Excalidraw-Self--Hosted-6965DB?logo=excalidraw&logoColor=white)](https://excalidraw.com)
[![WebSocket](https://img.shields.io/badge/Real--Time-WebSocket%20E2EE-010101?logo=socketdotio&logoColor=white)](#-colaboração-em-tempo-real--e2ee)
[![Licença](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 🎯 Visão Geral & Motivação

### 💡 Por que escolhemos:
Interface minimalista e fluida estilo *whiteboard*, com **curva de aprendizado zero** e suporte nativo a **colaboração síncrona em tempo real**. Permite auto-hospedagem leve, garantindo **total soberania** sobre as sessões e dados trafegados.

### 🧩 Problema que resolve:
Elimina o atrito e a complexidade na hora de conduzir reuniões ágeis, dinâmicas de ideação, design sprints, mapas mentais e rascunhos rápidos de arquitetura, permitindo que membros técnicos e não técnicos colaborem simultaneamente sem barreiras.

---

## 🏗️ Arquitetura do Sistema

O ambiente é composto por dois serviços desacoplados conteinerizados: o **Frontend Web SPA** do Excalidraw e o **Backend WebSocket Room** para transmissão de cursores, traços e estados de sala criptografados de ponta a ponta (E2EE).

```mermaid
flowchart TD
    subgraph Clientes["👥 Usuários & Navegadores"]
        U1["👤 Usuário A (Editor)"]
        U2["👤 Usuário B (Editor)"]
    end

    subgraph Infra["🐳 Stack Docker (infra/docker-compose.yml)"]
        direction TB
        WEB["🖥️ excalidraw-web<br/>(Porta :8080)<br/>Interface Web SPA"]
        ROOM["⚡ excalidraw-room<br/>(Porta :8081)<br/>Servidor WebSocket & Storage"]
    end

    U1 -- "HTTP :8080 (Carrega UI)" --> WEB
    U2 -- "HTTP :8080 (Carrega UI)" --> WEB

    U1 <== "WSS / WebSocket :8081<br/>(Criptografia E2EE)" ==> ROOM
    U2 <== "WSS / WebSocket :8081<br/>(Sincronização em Tempo Real)" ==> ROOM

    style WEB fill:#6965DB,stroke:#333,stroke-width:2px,color:#fff
    style ROOM fill:#009688,stroke:#333,stroke-width:2px,color:#fff
    style Clientes fill:#f9f9f9,stroke:#666,stroke-width:1px
    style Infra fill:#f0f4f8,stroke:#4a5568,stroke-width:1px
```

---

## 🚀 Como Executar (Quickstart)

### Pré-requisitos
- [Docker](https://docs.docker.com/get-docker/) (v20.10+)
- [Docker Compose](https://docs.docker.com/compose/) (v2.0+)

### 1. Clonar e Acessar o Repositório
```bash
git clone git@github.com:dxcdc/Desenho.git
cd Desenho
```

### 2. Configurar Variáveis de Ambiente
```bash
cp infra/.env.example infra/.env
```

### 3. Iniciar os Serviços
```bash
docker compose -f infra/docker-compose.yml up -d
```

### 4. Acessar a Aplicação
- **Frontend Web**: [http://localhost:8080](http://localhost:8080)
- **Servidor de Colaboração (Healthcheck)**: [http://localhost:8081/health](http://localhost:8081/health)

Para parar os serviços:
```bash
docker compose -f infra/docker-compose.yml down
```

---

## 🔒 Colaboração em Tempo Real & E2EE

O Excalidraw utiliza um modelo de segurança **Zero-Knowledge / End-to-End Encryption (E2EE)** nas salas de colaboração:

1. Ao criar uma sessão compartilhada, uma chave de criptografia AES-GCM de 128 bits é gerada diretamente no navegador do anfitrião.
2. A chave é anexada ao fragmento da URL (`#room=...,<chave>`), o qual **nunca é enviado ao servidor**.
3. O servidor (`excalidraw-room`) atua apenas como um relay de pacotes criptografados via WebSocket, sem capacidade de inspecionar ou decifrar os desenhos.

---

## 📁 Estrutura do Repositório

```text
Desenho/
├── README.md                          # Painel principal com visão geral e instruções de execução
├── .gitignore                         # Regras de exclusão de arquivos sensíveis e temporários
├── .github/
│   └── workflows/
│       └── automatizar_issues.yml     # Workflow de automação de issues no GitHub
├── docs/                              # Governança, infraestrutura e sustentação
│   ├── diretrizes_documentacao.md     # Padrões editoriais, Git Graph e ADRs
│   ├── estrategia_execucao.md         # Estratégia de branches e contribuição Git
│   ├── ajuda_infra.md                 # Arquitetura detalhada, portas e comandos Docker
│   ├── troubleshooting.md             # Soluções para problemas de conexão e WebSocket
│   └── prompt_ia.md                   # Contexto mestre para assistentes de IA no projeto
├── infra/                             # Infraestrutura e orquestração de containers
│   ├── docker-compose.yml             # Manifesto de execução dos serviços Excalidraw + Room
│   └── .env.example                   # Template de variáveis de ambiente
└── prompts/                           # Prompts especializados para diagramação e arquitetura
```

---

## 🌿 Fluxo Git e Visualização de Branches

Seguimos a convenção de branches e visualização gráfica via Git Graph CLI:

```mermaid
gitGraph
    commit id: "Initial Commit"
    commit id: "docs: diretrizes governanca"
    branch feature/infra-setup
    checkout feature/infra-setup
    commit id: "feat: adiciona docker-compose e env"
    checkout main
    merge feature/infra-setup id: "merge: infraestrutura pronta"
    commit id: "docs: atualiza README principal"
```

Para visualizar o histórico no terminal:
```bash
git log --graph --oneline --all --decorate
```

---

## 📚 Documentação Adicional

- [📖 Diretrizes de Documentação e Governança](docs/diretrizes_documentacao.md)
- [🛠️ Ajuda e Operação de Infraestrutura](docs/ajuda_infra.md)
- [🔍 Troubleshooting & Resolução de Problemas](docs/troubleshooting.md)
- [🌿 Estratégia de Execução e Git Flow](docs/estrategia_execucao.md)
