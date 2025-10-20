// database.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Define o caminho para o arquivo do banco de dados dentro da pasta DATA
const dbPath = path.join(__dirname, 'DATA', 'teatropro.db');

// Cria a conexão com o banco de dados. O arquivo será criado se não existir.
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        // Se ocorrer um erro ao conectar, exibe no console
        console.error('Erro ao conectar ao banco de dados SQLite:', err.message);
    } else {
        // Se a conexão for bem-sucedida, exibe uma mensagem
        console.log('✅ Conectado ao banco de dados SQLite.');
    }
});

// Cria a tabela de vendas se ela não existir
// Usamos `db.serialize` para garantir que os comandos rodem em ordem
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS vendas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            seatId TEXT UNIQUE NOT NULL,
            status TEXT NOT NULL,
            clienteNome TEXT NOT NULL,
            clienteCpf TEXT NOT NULL,
            clienteTelefone TEXT NOT NULL,
            clienteEmail TEXT NOT NULL,
            valor REAL NOT NULL,
            data TEXT NOT NULL,
            metodoPagamento TEXT,
            transactionId TEXT UNIQUE,
            checkedIn INTEGER DEFAULT 0
        )
    `, (err) => {
        if (err) {
            // Erro ao criar a tabela
            console.error('Erro ao criar tabela "vendas":', err.message);
        } else {
            // Tabela criada com sucesso ou já existia
            console.log('📋 Tabela "vendas" pronta.');
        }
    });
});

// Exporta a instância do banco de dados para ser usada em outros arquivos (como o server.js)
module.exports = db;