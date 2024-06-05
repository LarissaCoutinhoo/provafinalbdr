const express = require('express');
const path = require('path');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;


// Configuração do banco de dados
const config = {
    user: 'larissa',
    password: '654Azurel',
    server: 'fatecserver.database.windows.net',
    database: 'fatec',
    options: {
        encrypt: true // Dependendo da configuração do seu servidor SQL Server
    }
};

app.use(express.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname)));

// Rota para atualizar a vida do herói e do vilão
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


// Rota para fornecer os dados do herói e do vilão
app.get('/characters', async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();

        // Consulta para obter os dados do herói
        const heroResult = await request.query("SELECT * FROM Personagens WHERE Nome = 'heroi'");
        const heroi = heroResult.recordset[0];

        // Consulta para obter os dados do vilão
        const villainResult = await request.query("SELECT * FROM Personagens WHERE Nome = 'vilao'");
        const vilao = villainResult.recordset[0];

        res.json({ heroi, vilao });
    } catch (error) {
        console.error('Erro ao buscar dados do herói e do vilão:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do herói e do vilão.' });
    }
});

// Rota para registro de usuário
app.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        await sql.connect(config);
        const request = new sql.Request();

        // Verificar se o usuário já existe
        const checkUser = await request.query(`SELECT * FROM Usuarios WHERE Email = '${email}'`);
        if (checkUser.recordset.length > 0) {
            return res.status(400).send('Usuário já cadastrado.');
        }

        // Hash da senha
        const hashedSenha = await bcrypt.hash(senha, 10);

        // Inserir usuário no banco de dados
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

// Rota para login de usuário
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        await sql.connect(config);
        const request = new sql.Request();

        // Obter usuário do banco de dados
        const result = await request.query(`
            SELECT * FROM Usuarios WHERE Email = '${email}'
        `);

        if (result.recordset.length === 0) {
            return res.status(400).send('Usuário não encontrado.');
        }

        const user = result.recordset[0];

        // Verificar a senha
        const isMatch = await bcrypt.compare(senha, user.Senha);
        if (!isMatch) {
            return res.status(400).send('Senha incorreta.');
        }

        // Gerar token JWT
        const token = jwt.sign({ id: user.Id }, secret, { expiresIn: '1h' });

        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao realizar login.');
    }
});

// Rota para servir o arquivo de login
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

// Rota para servir o arquivo de dashboard
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Rota para servir o arquivo HTML principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor Express rodando na porta ${PORT}`);
});