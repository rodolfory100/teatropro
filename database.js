const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho do banco de dados
const dbPath = path.join(__dirname, 'dados.db');

// Criar conexão com o banco de dados
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Erro ao conectar ao banco de dados:', err.message);
    } else {
        console.log('✅ Conectado ao banco de dados SQLite');
    }
});

// Criar tabela se não existir
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS vendas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            seatId TEXT UNIQUE NOT NULL,
            status TEXT NOT NULL,
            clienteNome TEXT,
            clienteCpf TEXT,
            clienteTelefone TEXT,
            clienteEmail TEXT,
            valor REAL,
            data TEXT,
            metodoPagamento TEXT,
            transactionId TEXT,
            checkedIn INTEGER DEFAULT 0
        )
    `, (err) => {
        if (err) {
            console.error('❌ Erro ao criar tabela:', err.message);
        } else {
            console.log('✅ Tabela "vendas" pronta');
        }
    });
});

module.exports = db;

