# Shako 🚀

Bem-vindo ao repositório oficial da rede social Shako, uma plataforma social incrível para se conectar com amigos, compartilhar fotos, ouvir músicas do Spotify e muito mais! Aqui estão algumas informações importantes sobre as configurações e dependências do projeto.

## Imagens de Preview

Aqui estão algumas imagens de preview do Shako:

### Login

![Login](https://raw.githubusercontent.com/kwy404/Shako/main/preview/login.png)

### Perfil

![Perfil](https://raw.githubusercontent.com/kwy404/Shako/main/preview/profile_1.png)

### Perfil com Chat

![Perfil com Chat](https://raw.githubusercontent.com/kwy404/Shako/main/preview/profile_3.png)

### Perfil de uma pessoa que não é você

![Perfil de uma pessoa que não é você](https://raw.githubusercontent.com/kwy404/Shako/main/preview/profile_strange.png)

## Configurações do banco de dados 📦

Configure as informações do banco de dados no arquivo `.env`:

- **DB_HOST**: Endereço do servidor de banco de dados
- **DB_PORT**: Porta do banco de dados
- **DB_USER**: Usuário do banco de dados
- **DB_PASSWORD**: Senha do banco de dados
- **DB_NAME**: Nome do banco de dados

Exemplo de configuração no arquivo `.env`:
DB_HOST=seu-host-do-banco
DB_PORT=sua-porta
DB_USER=seu-usuario
DB_PASSWORD=sua-senha
DB_NAME=seu-banco

## Configurações de email 📧

Configure as informações de e-mail no arquivo `.env`:

- **EMAIL_HOST**: Servidor de email
- **EMAIL_PORT**: Porta do servidor de email
- **EMAIL_USER**: Nome de usuário de email
- **EMAIL_PASSWORD**: Senha de email

Exemplo de configuração no arquivo `.env`:
EMAIL_HOST=seu-servidor-de-email
EMAIL_PORT=sua-porta-de-email
EMAIL_USER=seu-usuario-de-email
EMAIL_PASSWORD=sua-senha-de-email

## Configurações do Shako 🌐

Defina o nome do seu site no arquivo `.env`:

- **NAME**: Nome do seu site

Exemplo de configuração no arquivo `.env`:
NAME=Nome do seu site

## Configurações do Cloudinary ☁️

Para gerenciar suas imagens e mídia, você pode configurar o Cloudinary no arquivo `.env`:

- **CLOUDINARY_CLOUD_NAME**: Nome da nuvem Cloudinary
- **CLOUDINARY_API_KEY**: Chave de API Cloudinary
- **CLOUDINARY_API_SECRET**: Segredo da API Cloudinary

Exemplo de configuração no arquivo `.env`:
CLOUDINARY_CLOUD_NAME=seu-nome-de-nuvem
CLOUDINARY_API_KEY=sua-chave-de-api
CLOUDINARY_API_SECRET=seu-segredo-de-api

## Integração com o Spotify 🎶

Habilitar a integração com o Spotify requer que você defina as seguintes variáveis no arquivo `.env`:

- **CLIENT_ID**: ID do cliente Spotify
- **CLIENT_SECRET**: Segredo do cliente Spotify
- **REDIRECT_URI**: URI de redirecionamento para o Spotify

Exemplo de configuração no arquivo `.env`:
CLIENT_ID=seu-client-id
CLIENT_SECRET=seu-client-secret
REDIRECT_URI=sua-uri-de-redirecionamento

## Comandos Disponíveis 📜

Você pode usar os seguintes comandos para executar diferentes partes da aplicação:

- `npm run app`: Inicia o servidor principal (sistema de login, registro e validação de token).
- `npm run dashboard`: Inicia o servidor do painel de controle (quando está logado).
- `npm run photo`: Inicia o servidor de fotos.
- `npm run spotify`: Inicia o servidor do Spotify.

### Desenvolvimento Local (npm run dev) 🧪

Para executar o ambiente de desenvolvimento, use o comando:

```bash
npm run dev
O script npm run dev inicia os seguintes serviços simultaneamente:

npm run app: Inicia o servidor principal, incluindo o sistema de login, registro e validação de token.
npm run dashboard: Inicia o servidor do painel de controle, utilizado quando o usuário está logado na plataforma.
npm run photo: Inicia o servidor de fotos.
npm run spotify: Inicia o servidor do Spotify.
Certifique-se de configurar corretamente as variáveis no arquivo .env antes de executar os comandos.

Observação: O Shako é um projeto em constante evolução. Verifique a documentação e as atualizações mais recentes no repositório oficial.

Aproveite a sua experiência no Shako! 🎉
```

```bash
Lembre-se de configurar as variáveis no arquivo `.env` de acordo com a configuração específica do seu ambiente. Substitua os exemplos no arquivo `.env` pelos valores reais que você deseja usar.
```