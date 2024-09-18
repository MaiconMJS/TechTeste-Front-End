# Documentação do Front-End do Projeto

## Introdução
Este projeto é um sistema de autenticação e chat em tempo real, desenvolvido utilizando **Vue.js 3**. Ele oferece funcionalidades como registro de usuários, login, verificação de conta via código, atualização de senha, e um chat em tempo real. Para a comunicação entre os componentes e a API, são usados **Axios** e **Socket.IO**. O gerenciamento de estado é feito com **Pinia**, enquanto o **Vue Router** cuida da navegação entre as páginas.

## Estrutura do Projeto
A estrutura do projeto segue o padrão das aplicações Vue.js, organizada em pastas e arquivos que facilitam a manutenção e expansão do código. As principais pastas são:

- **assets**: Contém arquivos estáticos, como imagens e estilos.
- **components**: Reúne componentes reutilizáveis, como modais de erro e botões de navegação.
- **views**: Contém as páginas principais (telas completas) da aplicação.
- **stores**: Gerencia o estado da aplicação utilizando o Pinia.
- **router**: Configura e gerencia as rotas de navegação.

## Configuração Inicial
Após clonar o repositório, é necessário instalar as dependências do projeto e configurar o ambiente de desenvolvimento. O projeto utiliza **npm** para a gestão de pacotes.

### Passos:
1. **Instalar dependências**: Execute `npm install` para baixar e instalar todas as dependências listadas no arquivo `package.json`.
2. **Iniciar o servidor de desenvolvimento**: Use o comando `npm run dev` para rodar o projeto localmente em modo de desenvolvimento.
3. **Compilar para produção**: Para compilar a aplicação para produção, execute `npm run build`. Isso cria uma versão otimizada do projeto para ser implantada em um servidor.

## Componentes Principais

### `App.vue`
O arquivo `App.vue` é o núcleo da aplicação, sendo responsável por configurar a estrutura básica do aplicativo e lidar com a autenticação do usuário. Ele monta os componentes de navegação, verifica se o usuário está autenticado, e carrega o token de autenticação do `localStorage`.

- **Barra de navegação**: A navegação é dinâmica, exibindo diferentes opções dependendo do estado de autenticação do usuário (logado ou não).
- **Axios global**: Uma instância global do Axios é configurada para garantir que todas as requisições HTTP feitas pela aplicação incluam automaticamente o token JWT (caso o usuário esteja autenticado).

### Verificação de Usuário (`VerifyComponent`)
Este componente é responsável por validar o código de verificação enviado para o e-mail do usuário após o registro.

- **Verificação do código**: O usuário deve inserir um código de verificação. Se o código for válido, o usuário é redirecionado para o login.
- **Mensagens de erro ou sucesso**: Dependendo do resultado da verificação, uma mensagem de erro ou sucesso é exibida ao usuário.

### Envio de Código (`SendCodeComponent`)
Este componente permite que o usuário solicite um código de autorização para redefinir sua senha.

- **Envio de código**: Ao inserir seu e-mail, o usuário pode solicitar um código de autorização para alteração de senha. O sistema informa o usuário sobre o sucesso ou falha da operação.

### Registro de Usuário (`RegisterComponent`)
O componente de registro coleta as informações do novo usuário, como e-mail e senha, e envia uma solicitação à API para criar uma nova conta.

- **Registro**: Após o registro bem-sucedido, o usuário é redirecionado para a página de verificação de conta, onde ele deve inserir o código enviado por e-mail.
- **Feedback visual**: O sistema informa se o processo de registro foi bem-sucedido ou se houve algum erro.

### Atualização de Senha (`PasswordUpdateComponent`)
Neste componente, o usuário pode redefinir sua senha. Ele deve fornecer o código de autorização recebido por e-mail, juntamente com a nova senha.

- **Redefinição de senha**: O usuário insere o código de autorização e a nova senha. Se a operação for bem-sucedida, o usuário é redirecionado para a página inicial.

### Login (`LoginComponent`)
O componente de login permite que os usuários façam login inserindo suas credenciais (e-mail e senha).

- **Autenticação via token**: O token JWT é utilizado para identificar o usuário nas requisições subsequentes.
- **Persistência de sessão**: O token e outros dados de usuário (como e-mail e imagem de perfil) são armazenados no `localStorage` para persistência da sessão entre recargas de página.

### Home (`HomeComponent`)
Esta é a página inicial do sistema, onde os usuários logados podem visualizar a lista de outros usuários online e iniciar um chat.

- **Listagem de usuários online**: A página exibe todos os usuários disponíveis para conversa. Ao clicar em um usuário, o sistema abre a tela de chat.
- **Notificações**: O sistema exibe notificações visuais e sonoras quando o usuário recebe uma nova mensagem.

### Chat (`ChatComponent`)
O componente de chat é o coração da funcionalidade de comunicação em tempo real.

- **Mensagens em tempo real**: Utilizando **Socket.IO**, as mensagens são trocadas em tempo real.
- **Histórico de mensagens**: O chat exibe o histórico de mensagens trocadas entre os usuários.

### Modal de Erro (`ErrorModal`)
Este componente exibe uma modal informativa quando ocorrem erros, especialmente em casos de falha de autenticação ou problemas com as requisições à API.

- **Mensagens de erro**: A modal é usada para exibir mensagens de erro personalizadas ao usuário.
- **Redirecionamento**: Em alguns casos, o usuário é redirecionado para a página de login.

## Gerenciamento de Estado com Pinia
O **Pinia** é utilizado para gerenciar o estado da aplicação de forma centralizada, como a autenticação e os dados do usuário.

- **Estado de autenticação**: O estado de autenticação (isAuthenticated) é armazenado no Pinia e é acessível por qualquer componente.
- **Sincronização com localStorage**: Os dados do usuário (como token, e-mail e imagem de perfil) são salvos no `localStorage` e carregados no estado do Pinia ao iniciar a aplicação.

## Rotas do Vue Router
O **Vue Router** é responsável por gerenciar a navegação entre as diferentes páginas do sistema.

- **Rotas protegidas**: Algumas páginas, como o chat e a página inicial, só podem ser acessadas se o usuário estiver autenticado.
- **Parâmetros de rota**: Algumas rotas recebem parâmetros, como o ID do usuário destinatário na página de chat.

## Integração com Axios
O **Axios** é utilizado para fazer requisições HTTP à API backend. Uma instância personalizada de Axios é configurada globalmente.

- **Interceptadores de requisição**: Antes de cada requisição, o Axios intercepta o pedido e adiciona o token de autenticação no cabeçalho.
- **Manuseio de erros**: As respostas de erro da API, como falhas de autenticação, são tratadas adequadamente, exibindo mensagens de erro ou redirecionando o usuário.

## WebSockets com Socket.IO
O sistema de chat em tempo real utiliza **Socket.IO** para estabelecer uma conexão bidirecional entre o servidor e os clientes.

- **Envio e recebimento de mensagens**: O **Socket.IO** permite que os usuários enviem e recebam mensagens em tempo real.
- **Status de presença**: O **Socket.IO** também é usado para indicar o status de presença dos usuários (online ou offline).

## Estilos e Animações
O projeto utiliza **TailwindCSS** para a estilização, proporcionando uma interface moderna e responsiva.

- **Layout responsivo**: O design é otimizado para diferentes tamanhos de tela.
- **Transições e animações**: Animações como transições de página e notificações são aplicadas para tornar a navegação mais fluida e agradável.
