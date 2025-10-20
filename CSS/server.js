const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Servir arquivos estáticos das pastas
app.use(express.static(__dirname));
app.use('/CSS', express.static(path.join(__dirname, 'CSS')));
app.use('/JS', express.static(path.join(__dirname, 'JS')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/DATA', express.static(path.join(__dirname, 'DATA')));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('🎭 Servidor Teatro Pro rodando!');
    console.log(`✅ Acesse: http://localhost:${PORT}`);
    console.log('📁 Pasta do projeto:', __dirname);
});