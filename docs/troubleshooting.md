# 🔍 Guia de Resolução de Problemas (Troubleshooting)

Este documento registra soluções para incidentes, comportamentos inesperados e dúvidas frequentes no ambiente do **Excalidraw (Desenho)**.

> [!IMPORTANT]
> **Alimentação Incremental:** Nunca apague registros deste documento. Novas entradas e soluções devem ser adicionadas incrementalmente no topo da seção correspondente.

---

## 🛠️ Tabela de Incidentes & Soluções Rápidas

| Problema | Causa Provável | Solução |
| :--- | :--- | :--- |
| **Colisão de porta `8080` com `proxy-manager` ou `8081` com `moodle`** | Serviços corporativos de infraestrutura pré-existentes na máquina host ocupando as portas 8080/8081. | Portas padrão da stack mapeadas para `8092` (Web) e `8093` (Room). Em caso de novo conflito, customize `EXCALIDRAW_PORT` e `EXCALIDRAW_ROOM_PORT` no `infra/.env`. |
| **Erro ao conectar à sala colaborativa (WebSocket)** | Variável `WS_SERVER_URL` incorreta ou bloqueio de proxy na porta `8093`. | Verifique se `infra/.env` aponta para o endereço alcançável pelo navegador. Se houver proxy reverso, certifique-se de repassar os headers `Upgrade` e `Connection: Upgrade`. |
| **Recursos de Copiar/Colar (Clipboard) desabilitados no navegador** | Acesso via IP sem certificado SSL/HTTPS. | O navegador bloqueia a API `navigator.clipboard` fora de `localhost` ou `https://`. Use um túnel seguro ou configure SSL com Caddy/Nginx. |
| **Container `excalidraw-room` reiniciando em loop** | Falha de inicialização de porta ou variável de ambiente com sintaxe inválida. | Execute `docker compose -f infra/docker-compose.yml logs excalidraw-room` para analisar o traceback do Node.js. |

---

## 📋 Diagnósticos Passo a Passo

### 1. Testar Conectividade com o Servidor Room
Para validar se o backend de colaboração está saudável, execute:
```bash
curl -I http://localhost:8093/
```
Resposta esperada: `HTTP/1.1 200 OK`

### 2. Verificar Logs de Conexão WebSocket
```bash
docker logs --tail 50 -f excalidraw-room
```
