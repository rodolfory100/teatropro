// Sistema de Gerenciamento de Ingressos - Teatro Pro
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema Teatro Pro carregado!');
    
    // Inicializar o sistema
    inicializarSistema();
});

async function inicializarSistema() {
    // Carregar dados iniciais
    await atualizarPainel();
    
    // Configurar eventos de venda
    configurarEventosVenda();
}

// Atualiza o painel com os dados da API
async function atualizarPainel() {
    try {
        const resumo = await IngressosAPI.getResumo();
        
        // Atualiza os elementos na página
        const elementos = {
            'total-ingressos': resumo.vendidos + ' ingressos vendidos',
            'total-arrecadado': 'R$ ' + resumo.total.toFixed(2),
            'ultimas-vendas': formatarUltimasVendas(resumo.vendas)
        };
        
        // Atualiza cada elemento
        for (const [id, valor] of Object.entries(elementos)) {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = valor;
            }
        }
        
    } catch (error) {
        console.error('Erro ao atualizar painel:', error);
    }
}

// Formata as últimas vendas para exibição
function formatarUltimasVendas(vendas) {
    if (!vendas || vendas.length === 0) {
        return 'Nenhuma venda realizada';
    }
    
    const ultimas = vendas.slice(-5).reverse(); // Últimas 5 vendas
    return ultimas.map(venda => 
        `${venda.data} - R$ ${venda.valor || 0}`
    ).join('\n');
}

// Configura os botões e eventos de venda
function configurarEventosVenda() {
    // Exemplo: botão para vender ingresso
    const btnVender = document.getElementById('btn-vender');
    if (btnVender) {
        btnVender.addEventListener('click', venderIngresso);
    }
    
    // Botão para atualizar dados
    const btnAtualizar = document.getElementById('btn-atualizar');
    if (btnAtualizar) {
        btnAtualizar.addEventListener('click', atualizarPainel);
    }
    
    // Botão para limpar dados (apenas para testes)
    const btnLimpar = document.getElementById('btn-limpar');
    if (btnLimpar) {
        btnLimpar.addEventListener('click', limparDados);
    }
}

// Função para vender um ingresso
async function venderIngresso() {
    const tipo = prompt('Tipo de ingresso (Inteira/Meia):');
    const valor = parseFloat(prompt('Valor do ingresso:'));
    
    if (tipo && !isNaN(valor)) {
        const sucesso = await IngressosAPI.venderIngresso({
            tipo: tipo,
            valor: valor,
            quantidade: 1
        });
        
        if (sucesso) {
            alert('Ingresso vendido com sucesso!');
            await atualizarPainel();
        } else {
            alert('Erro ao vender ingresso!');
        }
    }
}

// Função para limpar dados (apenas desenvolvimento)
async function limparDados() {
    if (confirm('Tem certeza que quer limpar todos os dados?')) {
        const dadosVazios = { ingressosVendidos: 0, vendas: [], totalArrecadado: 0 };
        const resultado = await IngressosAPI.salvarDados(dadosVazios);
        
        if (resultado.success) {
            alert('Dados limpos com sucesso!');
            await atualizarPainel();
        }
    }
}

// Função para buscar dados específicos (exemplo)
async function buscarVendasPorTipo(tipo) {
    const resumo = await IngressosAPI.getResumo();
    return resumo.vendas.filter(venda => venda.tipo === tipo);
}