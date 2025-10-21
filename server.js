const express = require('express');
const path = require('path');
const fs = require('fs');
const db = require('./database');
const app = express();

// 🔥 PORTA DINÂMICA PARA RENDER.COM
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(__dirname));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// 🔥 API PARA CARREGAR INGRESSOS DO BANCO DE DADOS
app.get('/api/ingressos', (req, res) => {
    db.all("SELECT * FROM vendas", [], (err, rows) => {
        if (err) {
            console.error('❌ Erro ao buscar dados no banco:', err.message);
            return res.status(500).json({ error: 'Erro ao ler dados de ingressos' });
        }

        const vendas = {};
        rows.forEach(row => {
            vendas[row.seatId] = {
                status: row.status,
                cliente: {
                    nome: row.clienteNome,
                    cpf: row.clienteCpf,
                    telefone: row.clienteTelefone,
                    email: row.clienteEmail
                },
                valor: row.valor,
                data: row.data,
                metodoPagamento: row.metodoPagamento,
                transactionId: row.transactionId,
                checkedIn: !!row.checkedIn
            };
        });

        console.log('📁 Dados carregados do banco de dados');
        res.json({ vendas: vendas });
    });
});


// 🔥 API PARA VENDER UM INGRESSO ESPECÍFICO
app.post('/api/vender', (req, res) => {
    const { seatId, cliente, valor, metodoPagamento } = req.body;

    const transactionId = 'TXN' + Date.now();

    const sql = `
        INSERT INTO vendas (seatId, status, clienteNome, clienteCpf, clienteTelefone, clienteEmail, valor, data, metodoPagamento, transactionId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [
        seatId,
        'sold',
        cliente.nome,
        cliente.cpf,
        cliente.telefone,
        cliente.email,
        valor,
        new Date().toISOString(),
        metodoPagamento,
        transactionId
    ], function (err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                console.log(`⚠️ Tentativa de venda de assento já ocupado: ${seatId}`);
                return res.status(409).json({ error: 'Este assento já foi vendido.' });
            }
            console.error('❌ Erro ao salvar venda no banco:', err.message);
            return res.status(500).json({ error: 'Erro ao salvar venda' });
        }

        console.log(`💾 Venda do assento ${seatId} salva com sucesso. ID: ${this.lastID}`);
        res.json({ success: true, transactionId: transactionId });
    });
});


// 🔥 API PARA LIBERAR / ESTORNAR UM ASSENTO
app.delete('/api/liberar/:seatId', (req, res) => {
    const seatId = req.params.seatId;

    const sql = "DELETE FROM vendas WHERE seatId = ?";
    db.run(sql, [seatId], function (err) {
        if (err) {
            console.error('❌ Erro ao liberar assento:', err.message);
            return res.status(500).json({ error: 'Erro ao liberar assento' });
        }

        if (this.changes === 0) {
            console.log(`⚠️ Nenhum assento encontrado com ID: ${seatId}`);
            return res.status(404).json({ error: 'Assento não encontrado' });
        }

        console.log(`🟢 Assento ${seatId} liberado com sucesso.`);
        res.json({ success: true });
    });
});


// ✅ TESTE DE API
app.get('/api/teste', (req, res) => {
    res.json({
        message: '✅ API TeatroPro funcionando com banco SQLite!',
        timestamp: new Date().toISOString(),
        status: 'online'
    });
});


// 🚀 INICIAR SERVIDOR
app.listen(PORT, '0.0.0.0', () => {
    console.log('🎭 SERVIDOR TEATRO PRO RODANDO!');
    console.log(`✅ ACESSE: http://localhost:${PORT}`);
    console.log('📊 Banco de dados: dados.db');
    console.log('🧪 Teste API: /api/teste');
});

