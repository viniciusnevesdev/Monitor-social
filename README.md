# Laços

PWA de monitoramento de interações sociais. A branch `main` corresponde à versão oficial.

## Versão atual

**v1.4.4**

- Remove o contorno artificial que engrossava os ícones SVG preenchidos em diferentes áreas do app.
- Preserva os traços dos ícones originalmente lineares para que eles não desapareçam.

**v1.4.3**

- Corrige a foto e a inicial das pessoas que ficavam invisíveis nos cartões do Radar da página inicial.
- Mantém o espaço do avatar com tamanho fixo, sem alterar o restante do layout aprovado dos cartões.

**v1.4.2**

- Adiciona **Começar do zero** nos Ajustes, com o botão **Apagar todos os dados deste aparelho**.
- Remove contatos e conversas locais sem restaurar os exemplos fictícios.
- Corrige a persistência de lista vazia: depois de apagar os dados, o app permanece vazio ao ser reaberto.
- Backups JSON e dados já enviados à nuvem continuam preservados e são informados antes da confirmação.

**v1.4.1**

- Permite escolher, trocar e remover uma foto para cada pessoa ao cadastrar ou editar o contato.
- Recorta e comprime a imagem automaticamente antes de salvar para reduzir o uso de armazenamento.
- Exibe a foto no Radar, detalhes, matriz de relacionamentos, lembretes e resumo semanal, mantendo a inicial colorida como fallback.
- Inclui a foto nos backups JSON e na sincronização em nuvem.

### Histórico de desenvolvimento

**v1.4.0-beta.17**

- Reorganiza os cartões do Radar e Pessoas conforme o cartão de referência, com situação ao lado do nome e tags logo abaixo.
- Ajusta proporções, espaçamentos e tamanhos de avatar, conversa, indicadores, lembrete e ações sem reintroduzir sobreposição.
- Substitui os ícones X pelo novo símbolo circular solicitado.

**v1.4.0-beta.16**

- Corrige a legibilidade do ícone de WhatsApp nos cartões do Radar antes de abrir o contato.
- Mantém o botão em fundo menta e força o SVG personalizado para verde visível, inclusive quando o SVG traz preenchimento branco próprio.
- Aumenta levemente o ícone e preserva contraste nos temas claro e escuro.

**v1.4.0-beta.5**

- Adiciona temas **Claro**, **Escuro** e **Automático**, com o Automático seguindo o tema do sistema.
- Aumenta o nome **Laços** no cabeçalho para equilibrar com o ícone.
- Compacta a barra inferior e aumenta o contraste dos ícones.
- Centraliza título e subtítulo da janela **Registrar Conversa** e move o fechar para o canto superior esquerdo com contraste adaptado ao tema.
- Compacta o cartão principal do Painel e centraliza o botão **Registrar Conversa**.
- Compacta o **Resumo Semanal de Conexões** sem remover informações.

**v1.4.0-beta.4**

- Beta sincronizada com a versão oficial **Laços v1.3.2**.
- Nome, interface, manifesto, PWA e comportamento funcional alinhados com a oficial.
- Mantidos apenas os identificadores próprios da Beta: selo BETA, ícone beta, branch/serviço separados e numeração beta.

**v1.4.0-beta.3**

- Biblioteca global de 49 ícones personalizados sincronizada integralmente com a versão oficial.

**v1.4.0-beta.2**

- Ícone exclusivo da versão beta atualizado, com selo visual BETA.
- Arquivos de ícone com nomes novos para evitar cache de instalações anteriores.

**v1.4.0-beta.1**

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
