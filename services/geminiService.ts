import { GoogleGenAI } from "@google/genai";
import { BusinessMetrics, Insight } from "../types";

// Note: In a real environment, strict error handling for missing keys is needed.
// This assumes the environment variable is available as per instructions.
const apiKey = process.env.API_KEY || ''; 

export const generateBusinessInsights = async (metrics: BusinessMetrics): Promise<Insight[]> => {
  if (!apiKey) {
    console.warn("API Key is missing. Returning mock insights.");
    return [
      { id: 'mock-1', title: 'Connect API Key', description: 'Please provide a valid API Key to receive real-time business insights.', type: 'info', actionable: true },
    ];
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an advanced business analyst for the WorkCore OS platform.
    Analyze the following business metrics for an SME and provide 3 concise, actionable insights.
    
    Metrics:
    - Total Revenue: $${metrics.totalRevenue}
    - Active Leads: ${metrics.activeLeads}
    - Pending Invoices: ${metrics.pendingInvoices}
    - Low Stock Items: ${metrics.lowStockItems}
    - Trend: ${JSON.stringify(metrics.revenueTrend)}

    Return the response as a JSON array of objects with the following structure:
    [{ "title": "string", "description": "string", "type": "opportunity" | "risk" | "info" }]
    
    Do not include markdown code blocks. Just the raw JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from Insights service");
    
    const parsed = JSON.parse(text);
    
    return parsed.map((item: any, index: number) => ({
      id: `gen-${index}-${Date.now()}`,
      title: item.title,
      description: item.description,
      type: item.type,
      actionable: true
    }));

  } catch (error) {
    console.error("Insights API Error:", error);
    return [
      { id: 'err-1', title: 'Insight Generation Failed', description: 'Could not reach the Insights service. Please try again later.', type: 'risk', actionable: false }
    ];
  }
};