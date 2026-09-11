# Monitor Social

PWA de monitoramento de interações sociais.

## Versão atual

**v1.3.1**

- Ícone principal atualizado com a nova identidade visual de contatos e relações sociais.
- Arquivos de ícone receberam novos nomes para forçar a atualização em instalações já existentes.

**v1.3.0**

## Execução

- Build: `npm run build`
- Start: `npm run start`
- Health check: `/api/health`

O servidor usa automaticamente a variável `PORT` fornecida pela hospedagem.

## Persistência dos dados

A sincronização em nuvem usa o arquivo `cloud_vault.json`.

A configuração global do editor de ícones usa `icon_overrides.json` no mesmo diretório persistente. O app não importa as escolhas antigas de ícones salvas no `localStorage`.

O editor global exige a variável `ICON_EDITOR_KEY` para qualquer alteração. A leitura dos ícones permanece pública para que todos os aparelhos exibam a mesma configuração.

Na primeira inicialização da v1.3.0, a configuração final da v1.2.0 é copiada para `icon-backups/icon_overrides-v1.2.0-final.json` dentro do volume persistente.

- Localmente, ele é salvo em `data/`.
- Na Railway, se um Volume estiver conectado, o app usa automaticamente `RAILWAY_VOLUME_MOUNT_PATH`.
- A pasta `data/` está no `.gitignore` e não deve ser enviada ao GitHub.

## Deploy na Railway

1. Criar um projeto a partir deste repositório GitHub.
2. Conectar um Volume ao serviço.
3. Usar **/data** como Mount Path do Volume.
4. Gerar um domínio público em Networking.
5. Abrir `/api/health` para confirmar que o backend está ativo.
6. Testar upload e download da sincronização antes de usar dados reais.

A Railway detecta os scripts de build/start do `package.json`; não é necessário `railway.json`.
