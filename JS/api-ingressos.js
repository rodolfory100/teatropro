// =================================================================================
// ARQUIVO: api-ingressos.js
// DESCRIÇÃO: Centraliza todas as chamadas para a API do backend no Render.
// VERSÃO FINAL: Garante que o seatId seja enviado para o frontend.
// =================================================================================

// 🔥 URL DO SEU BACKEND NO RENDER 🔥
const API_BASE_URL = 'https://teatropro-backend.onrender.com';

class IngressosAPI {
    // --- MÉTODOS PRINCIPAIS (USADOS PELO index.html) ---

    // Pega o resumo dos dados e já formata para o painel
    static async getResumo() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/ingressos`);
            if (!response.ok) throw new Error(`Erro na rede: ${response.statusText}`);
            const dadosBrutos = await response.json();
            
            const vendasArray = [];
            let total = 0;

            // Percorre o objeto para não perder o seatId (que é a chave)
            for (const seatId in dadosBrutos.vendas) {
                const venda = dadosBrutos.vendas[seatId];
                vendasArray.push({
                    ...venda, // inclui todos os dados originais
                    seatId: seatId // adiciona o seatId de volta
                });
                total += venda.valor || 0;
            }

            return {
                vendidos: vendasArray.length,
                total: total,
                vendas: vendasArray.map(v => ({
                    ...v, // mantém o seatId aqui também
                    data: new Date(v.data).toLocaleString('pt-BR'),
                    valor: v.valor
                }))
            };
        } catch (error) {
            console.error("Erro em IngressosAPI.getResumo():", error);
            return { vendidos: 0, total: 0, vendas: [] };
        }
    }

    // Envia uma nova venda para o backend
    static async venderIngresso(dadosVenda) {
        try {
            const payloadParaBackend = {
                seatId: dadosVenda.assento || `A${Date.now()}`,
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

            return resultado.success;
        } catch (error) {
            console.error("Erro em IngressosAPI.venderIngresso():", error);
            return false;
        }
    }

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

            return resultado.success;
        } catch (error) {
            console.error("Erro em IngressosAPI.liberarAssento():", error);
            return false;
        }
    }
}

// Torna a classe disponível globalmente
window.IngressosAPI = IngressosAPI;