# Shako 🚀

Bem-vindo ao repositório oficial da rede social Shako, uma plataforma social incrível para se conectar com amigos, compartilhar fotos, ouvir músicas do Spotify e muito mais! Aqui estão algumas informações importantes sobre as configurações e dependências do projeto.

## Configurações do banco de dados 📦

Para configurar o banco de dados, você pode utilizar o arquivo `.env` com as seguintes variáveis:

- **DB_HOST**: mysql-150185-0.cloudclusters.net
- **DB_PORT**: 18220
- **DB_USER**: admin
- **DB_PASSWORD**: WHiiaDKm
- **DB_NAME**: shako

## Configurações de email 📧

Utilize as seguintes configurações de email para a funcionalidade de email da aplicação:

- **EMAIL_HOST**: smtp.protonmail.ch
- **EMAIL_PORT**: 465
- **EMAIL_USER**: shako-not-reply@proton.me
- **EMAIL_PASSWORD**: X@nde123

## Configurações do Shako 🌐

- **NAME**: Shako

## Configurações do Cloudinary ☁️

Para gerenciar suas imagens e mídia, utilizamos o serviço de armazenamento em nuvem Cloudinary. Configure as seguintes variáveis:

- **CLOUDINARY_CLOUD_NAME**: dgqj83cdm
- **CLOUDINARY_API_KEY**: 892858926497658
- **CLOUDINARY_API_SECRET**: I_N8mPmw9ssGInW5XmXZXqe1eyQ

## Integração com o Spotify 🎶

O Shako permite que você conecte sua conta do Spotify para desfrutar de música durante a navegação. Para habilitar essa funcionalidade, configure as seguintes variáveis:

- **CLIENT_ID**: dcbdff61d5a443afaba5b0b242893915
- **CLIENT_SECRET**: 974c25e65efa4a9a8094be3ab4a1eb28
- **REDIRECT_URI**: http://localhost:5173/spotify

## Configuração do Projeto 🛠️

As seguintes são as informações relacionadas ao projeto:

- **type**: commonjs
- **name**: shako
- **version**: 1.0.0
- **description**: (Adicione uma descrição do seu projeto)
- **main**: index.js

## Scripts disponíveis 📜

Você pode usar os seguintes scripts para executar diferentes partes da aplicação:

- `npm run app`: Inicia o servidor principal (sistema de login/registro/validação de token).
- `npm run dashboard`: Inicia o servidor do painel de controle (quando está logado).

### Desenvolvimento Local (npm run dev) 🧪

Para executar o ambiente de desenvolvimento, use o comando:

```bash
npm run dev
O script npm run dev inicia os seguintes serviços simultaneamente:

npm run app: Inicia o servidor principal, incluindo o sistema de login, registro e validação de token.
npm run dashboard: Inicia o servidor do painel de controle, utilizado quando o usuário está logado na plataforma.
Dependências Principais 📦
O Shako utiliza várias bibliotecas e pacotes para funcionar corretamente. As principais dependências incluem:

axios
chalk
cloudinary
cors
dotenv
express
knex
memcached
multer
mysql
nodemailer
random-token-generator
redis
socket.io
spotify-web-api-node
uuid
websocket
ws
Certifique-se de instalar todas as dependências antes de executar o projeto.

Observação: O Shako é um projeto em constante evolução. Verifique a documentação e as atualizações mais recentes no repositório oficial.

Aproveite a sua experiência no Shako! 🎉
```