# 🔍 Guia de Resolução de Problemas (Troubleshooting)

Este documento registra soluções para incidentes, comportamentos inesperados e dúvidas frequentes no ambiente do **Excalidraw (Desenho)**.

> [!IMPORTANT]
> **Alimentação Incremental:** Nunca apague registros deste documento. Novas entradas e soluções devem ser adicionadas incrementalmente no topo da seção correspondente.

---

## 🛠️ Tabela de Incidentes & Soluções Rápidas

| Problema | Causa Provável | Solução |
| :--- | :--- | :--- |
| **Erro ao conectar à sala colaborativa (WebSocket)** | Variável `WS_SERVER_URL` incorreta ou bloqueio de proxy na porta `8081`. | Verifique se `infra/.env` aponta para o endereço alcançável pelo navegador. Se houver proxy reverso, certifique-se de repassar os headers `Upgrade` e `Connection: Upgrade`. |
| **Recursos de Copiar/Colar (Clipboard) desabilitados no navegador** | Acesso via IP sem certificado SSL/HTTPS. | O navegador bloqueia a API `navigator.clipboard` fora de `localhost` ou `https://`. Use um túnel seguro ou configure SSL com Caddy/Nginx. |
| **Porta 8080 ou 8081 já em uso no host** | Conflito com outro serviço ou container Docker em execução. | Altere `EXCALIDRAW_PORT` ou `EXCALIDRAW_ROOM_PORT` no arquivo `infra/.env` para portas livres (ex: `8090` e `8091`). |
| **Container `excalidraw-room` reiniciando em loop** | Falha de inicialização de porta ou variável de ambiente com sintaxe inválida. | Execute `docker compose -f infra/docker-compose.yml logs excalidraw-room` para analisar o traceback do Node.js. |

---

## 📋 Diagnósticos Passo a Passo

### 1. Testar Conectividade com o Servidor Room
Para validar se o backend de colaboração está saudável, execute:
```bash
curl -I http://localhost:8081/health
```
Resposta esperada: `HTTP/1.1 200 OK`

### 2. Verificar Logs de Conexão WebSocket
```bash
docker logs --tail 50 -f excalidraw-room
```
