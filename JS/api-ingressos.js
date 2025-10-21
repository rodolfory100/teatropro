// =================================================================================
// ARQUIVO: api-ingressos.js
// DESCRIÇÃO: Centraliza todas as chamadas para a API do backend no Render.
// VERSÃO OTIMIZADA: As funções agora chamam os endpoints corretos do backend.
// =================================================================================

// 🔥 URL DO SEU BACKEND NO RENDER 🔥
const API_BASE_URL = 'https://teatropro-backend.onrender.com';

class IngressosAPI {
    // --- MÉTODOS PRINCIPAIS (USADOS PELO main.js) ---

    // Pega o resumo dos dados e já formata para o painel
    static async getResumo() {
        try {
            // 1. Busca os dados brutos no backend
            const response = await fetch(`${API_BASE_URL}/api/ingressos`);
            if (!response.ok) throw new Error(`Erro na rede: ${response.statusText}`);
            const dadosBrutos = await response.json();
            
            // 2. Processa os dados para o formato que o main.js espera
            const vendasArray = Object.values(dadosBrutos.vendas || {});
            const total = vendasArray.reduce((soma, venda) => soma + (venda.valor || 0), 0);

            return {
                vendidos: vendasArray.length,
                total: total,
                vendas: vendasArray.map(v => ({
                    data: new Date(v.data).toLocaleString('pt-BR'),
                    valor: v.valor
                }))
            };
        } catch (error) {
            console.error("Erro em IngressosAPI.getResumo():", error);
            // Retorna um objeto vazio em caso de erro para não quebrar o frontend
            return { vendidos: 0, total: 0, vendas: [] };
        }
    }

    // Envia uma nova venda para o backend
    static async venderIngresso(dadosVenda) {
        try {
            // O seu backend espera um objeto com 'seatId', 'cliente', 'valor', 'metodoPagamento'.
            // Vamos adaptar o que chega do frontend para o que o backend espera.
            const payloadParaBackend = {
                seatId: dadosVenda.assento || `A${Date.now()}`, // Gera um ID se não for fornecido
                cliente: dadosVenda.cliente || { nome: 'Cliente Padrão', cpf: '00000000000' },
                valor: dadosVenda.valor,
                metodoPagamento: dadosVenda.metodoPagamento || 'Pix'
            };

            const response = await fetch(`${API_BASE_URL}/api/vender`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadParaBackend),
            });

            const resultado = await response.json();

            if (!response.ok) {
                throw new Error(resultado.error || 'Erro ao vender ingresso.');
            }

            return resultado.success; // Retorna true ou false
        } catch (error) {
            console.error("Erro em IngressosAPI.venderIngresso():", error);
            return false;
        }
    }

    // --- MÉTODOS ADICIONAIS (PARA FUNCIONALIDADES FUTURAS) ---

    // Libera (estorna) um assento no backend
    static async liberarAssento(seatId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/liberar/${seatId}`, {
                method: 'DELETE',
            });

            const resultado = await response.json();

            if (!response.ok) {
                throw new Error(resultado.error || 'Erro ao liberar assento.');
            }

            return resultado.success; // Retorna true ou false
        } catch (error) {
            console.error("Erro em IngressosAPI.liberarAssento():", error);
            return false;
        }
    }


    // --- MÉTODOS ANTIGOS (AGORA OBSOLETOS) ---
    // A lógica de salvar e carregar dados genéricos foi substituída pelos endpoints específicos
    // (vender, liberar), que é uma abordagem mais segura e correta.
    static async carregarDados() {
        console.warn("AVISO: 'carregarDados' é obsoleto. Use 'getResumo()'.");
        return this.getResumo();
    }

    static async salvarDados(dados) {
        console.warn("AVISO: 'salvarDados' é obsoleto e não funciona mais. Use 'venderIngresso()'.");
        return { success: false };
    }
}

// Torna a classe disponível globalmente para o main.js
window.IngressosAPI = IngressosAPI;