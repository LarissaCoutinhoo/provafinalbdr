# Jogo Herói e Vilão - LUNA VS SOLAR

## Descrição

Este é um jogo onde você pode controlar uma heroína e uma vilã, cada uma com suas próprias ações. Você pode fazer um cadastro e posteriormente logar na aplicação, o jogo também possui um dashboard que exibe as vidas atuais dos personagens juntamente com as suas últimas ações. Todos os dados da aplicação ficam salvos em um banco de dados Azure.

## Acesso Online

[Link para acessar a aplicação online](https://seu-site.com)

## Tecnologias Utilizadas

- HTML
- CSS
- JavaScript (Vue.js)
- Node.js (Express, mssql, bcrypt, jsonwebtoken)

## Instalação

Para executar este projeto localmente, siga as instruções abaixo:

1. **Clone o repositório**

2. **Instale as dependências:**
Certifique-se de ter o Node.js instalado. Em seguida, instale as dependências do projeto:
'npm install'

3. **Configuração do Banco de Dados:**
- Certifique-se de ter configurado o banco de dados SQL Server. Você pode usar o Azure SQL ou qualquer outro SQL Server.
- Crie um banco de dados chamado `fatec`.
- Certifique-se de que as tabelas `Personagens` e `Usuarios` já foram criadas.
- Configure as credenciais do banco de dados no arquivo `server.js`.
- Inicie o servidor Node.js.

O projeto estará disponível em [http://localhost:3000](http://localhost:3000).

## Utilização

- Para acessar o jogo, abra o arquivo `index.html` no seu navegador.
- Para acessar o dashboard, abra o arquivo `dashboard.html` no seu navegador.
- Para acessar a página de login, abra o arquivo `login.html` no seu navegador.
- Para acessar a página de registro, abra o arquivo `register.html` no seu navegador.

## Código Fonte Node.js
```javascript
const express = require('express');
const path = require('path');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

const config = {
    user: 'larissa',
    password: '654Azurel',
    server: 'fatecserver.database.windows.net',
    database: 'fatec',
    options: {
        encrypt: true
    }
};

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post('/atualizarVida', async (req, res) => {
    const { vidaHeroi, vidaVilao } = req.body;

    try {
        await sql.connect(config);
        const request = new sql.Request();
        await request.query(`
      MERGE INTO Personagens AS target
      USING (VALUES ('heroi', ${vidaHeroi}), ('vilao', ${vidaVilao})) AS source (Nome, Vida)
      ON target.Nome = source.Nome
      WHEN MATCHED THEN
        UPDATE SET Vida = source.Vida
      WHEN NOT MATCHED THEN
        INSERT (Nome, Vida) VALUES (source.Nome, source.Vida);
      `);
        res.status(200).send('Vida do herói e do vilão atualizada com sucesso.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao atualizar a vida do herói e do vilão.');
    }
});

app.get('/characters', async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();

        const heroResult = await request.query("SELECT * FROM Personagens WHERE Nome = 'heroi'");
        const heroi = heroResult.recordset[0];

        const villainResult = await request.query("SELECT * FROM Personagens WHERE Nome = 'vilao'");
        const vilao = villainResult.recordset[0];

        res.json({ heroi, vilao });
    } catch (error) {
        console.error('Erro ao buscar dados do herói e do vilão:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do herói e do vilão.' });
    }
});

app.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        await sql.connect(config);
        const request = new sql.Request();

        const checkUser = await request.query(`SELECT * FROM Usuarios WHERE Email = '${email}'`);
        if (checkUser.recordset.length > 0) {
            return res.status(400).send('Usuário já cadastrado.');
        }

        const hashedSenha = await bcrypt.hash(senha, 10);

        await request.query(`
            INSERT INTO Usuarios (Nome, Email, Senha)
            VALUES ('${nome}', '${email}', '${hashedSenha}')
        `);

        res.status(201).send('Usuário cadastrado com sucesso.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao cadastrar usuário.');
    }
});

const secret = 'bb233ad0b2b004a8066b563f6a537622c39d8d13f4d90a185f2ac2bbf4060b40';

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        await sql.connect(config);
        const request = new sql.Request();

        const result = await request.query(`
            SELECT * FROM Usuarios WHERE Email = '${email}'
        `);

        if (result.recordset.length === 0) {
            return res.status(400).send('Usuário não encontrado.');
        }

        const user = result.recordset[0];

        const isMatch = await bcrypt.compare(senha, user.Senha);
        if (!isMatch) {
            return res.status(400).send('Senha incorreta.');
        }

        const token = jwt.sign({ id: user.Id }, secret, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao realizar login.');
    }
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
});
```
## Screenshots

### Tela de Cadastro
Tela de cadastro efetuado com sucesso.
![Tela de cadastro efetuado com sucesso](https://github.com/LarissaCoutinhoo/provafinalbdr/blob/main/IMG/cadastro1.png)
Tela de cadastro sem êxito - usuário já cadastrado.
![Tela de cadastro sem êxito - usuário já cadastrado](https://github.com/LarissaCoutinhoo/provafinalbdr/blob/main/IMG/cadastro2.png)

### Tela de Login
Tela de login sem êxito - credenciais erradas.
![Tela de login efetuado com sucesso](https://github.com/LarissaCoutinhoo/provafinalbdr/blob/main/IMG/login1.png)
Tela de login efetuado com sucesso.
![Tela de login sem êxito - credenciais erradas](https://github.com/LarissaCoutinhoo/provafinalbdr/blob/main/IMG/login2.png)

### Tela Principal
Tela principal da aplicação.
![Tela principal]([screenshots/tela_principal.png](https://github.com/LarissaCoutinhoo/provafinalbdr/blob/main/IMG/jogo.png)

### Dashboard
Tela do dashboard.
![Dashboard]([screenshots/dashboard.png](https://github.com/LarissaCoutinhoo/provafinalbdr/blob/main/IMG/dashboard.png)

### Obrigada por visitar este projeto.
