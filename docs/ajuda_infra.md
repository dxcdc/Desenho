# 🛠️ Ajuda & Operação de Infraestrutura (Excalidraw)

Este documento detalha o funcionamento técnico da stack de infraestrutura do **Excalidraw (Desenho)**, suas portas, topologia de rede, comandos operacionais e boas práticas de implantação em produção.

---

## 1. Topologia de Serviços & Portas

| Serviço | Container | Imagem Base | Porta Externa (Padrão) | Porta Interna | Descrição |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend Web** | `excalidraw-web` | `excalidraw/excalidraw:latest` | `8080/tcp` | `80/tcp` | Interface web em React SPA que serve a aplicação client-side. |
| **Backend de Colaboração** | `excalidraw-room` | `excalidraw/excalidraw-room:latest` | `8081/tcp` | `80/tcp` | Servidor WebSocket/HTTP em Node.js para troca de mensagens e sessões colaborativas. |

---

## 2. Comandos Operacionais Frequentes

Todos os comandos abaixo devem ser executados a partir da raiz do repositório:

### Subir os serviços em segundo plano:
```bash
docker compose -f infra/docker-compose.yml up -d
```

### Verificar status e integridade (Healthcheck):
```bash
docker compose -f infra/docker-compose.yml ps
```

### Acompanhar logs em tempo real:
```bash
docker compose -f infra/docker-compose.yml logs -f
```

### Reiniciar os serviços:
```bash
docker compose -f infra/docker-compose.yml restart
```

### Parar e remover containers:
```bash
docker compose -f infra/docker-compose.yml down
```

---

## 3. Implantação em Produção com Proxy Reverso (Nginx / Caddy / Traefik)

Para expor o Excalidraw com SSL (HTTPS / WSS), configure um proxy reverso apontando para as portas locais.

> [!IMPORTANT]
> **Requisito HTTPS/WSS:** A API do Clipboard (Copiar/Colar imagens e elementos) e o Web Crypto API dos navegadores modernos exigem contexto seguro (`https://` ou `localhost`). Para uso em rede corporativa ou internet, o uso de SSL/TLS é obrigatório.

### Exemplo de Configuração Nginx:

```nginx
# Frontend Web
server {
    server_name desenho.suaempresa.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Backend Room (WebSocket)
server {
    server_name desenho-room.suaempresa.com;

    location / {
        proxy_pass http://127.0.0.1:8081;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
