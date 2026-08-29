# 🚀 Guia de Migração & Deploy em Produção (CDC)

Este documento registra o procedimento operacional para deploy e manutenção do **Excalidraw (Desenho)** em ambientes de produção.

---

## 🌐 Ambiente de Produção Oficial

- **Servidor VPS**: `76.13.227.135`
- **URL Pública**: [https://desenho.cdc.org.br](https://desenho.cdc.org.br)
- **Diretório da Aplicação**: `/opt/desenho`
- **Orquestrador / Proxy Reverso**: Traefik (via Easypanel `/etc/easypanel/traefik/config/desenho-custom.yaml`) + SSL Automático

---

## 🛠️ Procedimento de Deploy / Atualização no Servidor

### 1. Conectar via SSH:
```bash
ssh root@76.13.227.135
```

### 2. Acessar o Diretório e Atualizar o Código:
```bash
cd /opt/desenho
git pull origin main
```

### 3. Recompilar e Reiniciar os Containers:
```bash
docker compose -f infra/docker-compose.yml up -d --build
```

---

## ⚙️ Configuração de Roteamento Traefik (`/etc/easypanel/traefik/config/desenho-custom.yaml`)

```yaml
http:
  routers:
    http-desenho-custom:
      entryPoints:
        - "http"
      priority: 100
      rule: "Host(`desenho.cdc.org.br`)"
      middlewares:
        - "redirect-to-https"
      service: "desenho-web-service"
    https-desenho-room:
      entryPoints:
        - "https"
      priority: 120
      rule: "Host(`desenho.cdc.org.br`) && (PathPrefix(`/socket.io`) || PathPrefix(`/rooms`))"
      service: "desenho-room-service"
      tls:
        certResolver: "letsencrypt"
        domains:
          - main: "desenho.cdc.org.br"
    https-desenho-web:
      entryPoints:
        - "https"
      priority: 100
      rule: "Host(`desenho.cdc.org.br`)"
      service: "desenho-web-service"
      tls:
        certResolver: "letsencrypt"
        domains:
          - main: "desenho.cdc.org.br"

  services:
    desenho-web-service:
      loadBalancer:
        passHostHeader: true
        servers:
          - url: "http://76.13.227.135:8092"
    desenho-room-service:
      loadBalancer:
        passHostHeader: true
        servers:
          - url: "http://76.13.227.135:8093"
```
