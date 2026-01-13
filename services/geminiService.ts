
import { GoogleGenAI } from "@google/genai";
import { DatabaseState } from "../types";

export const geminiService = {
  async getBusinessAdvice(state: DatabaseState) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const summary = {
      totalSales: state.sales.length,
      revenue: state.sales.reduce((acc, s) => acc + s.value, 0),
      expenses: state.expenses.reduce((acc, e) => acc + e.value, 0),
      topPaymentMethod: this.getTopPaymentMethod(state),
      vehicleMix: this.getVehicleMix(state)
    };

    const prompt = `
      Analise os seguintes dados de um lava-jato (Lava Rápido Pro v2.0):
      Faturamento Total: R$ ${summary.revenue}
      Despesas Totais: R$ ${summary.expenses}
      Número de Vendas: ${summary.totalSales}
      Mix de Veículos: ${JSON.stringify(summary.vehicleMix)}
      Método de Pagamento Principal: ${summary.topPaymentMethod}

      Como especialista em gestão de negócios automotivos, forneça 3 dicas curtas e acionáveis para aumentar o lucro ou melhorar a eficiência deste estabelecimento. Seja direto e profissional em português.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text;
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Não foi possível gerar insights no momento. Verifique sua conexão.";
    }
  },

  getTopPaymentMethod(state: DatabaseState) {
    const counts: Record<string, number> = {};
    state.sales.forEach(s => counts[s.paymentMethod] = (counts[s.paymentMethod] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  },

  getVehicleMix(state: DatabaseState) {
    const mix: Record<string, number> = {};
    state.sales.forEach(s => mix[s.vehicleSize] = (mix[s.vehicleSize] || 0) + 1);
    return mix;
  }
};
