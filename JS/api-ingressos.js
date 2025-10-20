// API para gerenciar ingressos - substitui o localStorage
class IngressosAPI {
    static async carregarDados() {
        try {
            const response = await fetch('/api/ingressos');
            if (!response.ok) throw new Error('Erro na rede');
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Erro ao carregar ingressos:', error);
            return { ingressosVendidos: 0, vendas: [], totalArrecadado: 0 };
        }
    }

    static async salvarDados(dados) {
        try {
            const response = await fetch('/api/ingressos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dados)
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao salvar ingressos:', error);
            return { success: false };
        }
    }

    static async venderIngresso(dadosVenda) {
        try {
            const dadosAtuais = await this.carregarDados();
            
            // Adiciona a nova venda
            dadosAtuais.vendas.push({
                id: Date.now(),
                data: new Date().toLocaleString('pt-BR'),
                ...dadosVenda
            });
            
            // Atualiza totais
            dadosAtuais.ingressosVendidos += dadosVenda.quantidade || 1;
            dadosAtuais.totalArrecadado += dadosVenda.valor || 0;
            
            // Salva
            const resultado = await this.salvarDados(dadosAtuais);
            return resultado.success;
            
        } catch (error) {
            console.error('Erro ao vender ingresso:', error);
            return false;
        }
    }

    static async getResumo() {
        const dados = await this.carregarDados();
        return {
            vendidos: dados.ingressosVendidos,
            total: dados.totalArrecadado,
            vendas: dados.vendas
        };
    }
}

// Torna disponível globalmente
window.IngressosAPI = IngressosAPI;