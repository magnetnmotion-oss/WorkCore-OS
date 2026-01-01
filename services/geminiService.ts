
import { GoogleGenAI } from "@google/genai";
import { BusinessMetrics, Insight, AIChatMessage } from "../types";

// Always use process.env.API_KEY directly for initialization
const apiKey = process.env.API_KEY; 

export const generateBusinessInsights = async (metrics: BusinessMetrics): Promise<Insight[]> => {
  if (!apiKey) {
    return [
      { id: 'mock-1', title: 'Setup AI Insights', description: 'Enable Gemini AI in your workspace to get real-time performance tracking.', type: 'info', actionable: true },
    ];
  }

  // Initializing GoogleGenAI with the mandatory named parameter
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are an advanced business analyst for the OMMI OS platform.
    Analyze the following business metrics for an SME and provide 3 concise, actionable insights.
    
    Metrics:
    - Total Revenue: KES ${metrics.totalRevenue}
    - Active Leads: ${metrics.activeLeads}
    - Pending Invoices: ${metrics.pendingInvoices}
    - Low Stock Items: ${metrics.lowStockItems}
    - Trend: ${JSON.stringify(metrics.revenueTrend)}

    Return exactly 3 insights as a JSON array.
    Structure: [{ "title": "string", "description": "string", "type": "opportunity" | "risk" | "info" }]
  `;

  try {
    // Correct usage of ai.models.generateContent with model name and contents
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    // Extracting text from GenerateContentResponse using the .text property
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
      { id: 'err-1', title: 'Reviewing sales data...', description: 'We are processing your latest transactions for performance tips.', type: 'info', actionable: false }
    ];
  }
};

export const chatWithAssistant = async (history: AIChatMessage[], metrics: BusinessMetrics): Promise<string> => {
  if (!apiKey) return "AI Assistant is currently offline. Please check your API key.";

  // Initializing GoogleGenAI with the mandatory named parameter
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are 'Ommi Assistant', the AI co-pilot for OMMI OS.
    You help business owners manage their SME.
    You have access to current metrics: ${JSON.stringify(metrics)}.
    Be helpful, professional, and concise. 
    Use the user's currency (KES) when discussing money.
    Suggest specific actions in Sales, Inventory, or Finance.
  `;

  try {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction,
      },
    });

    // Send the last message
    const lastUserMessage = history[history.length - 1].text;
    const response = await chat.sendMessage({ message: lastUserMessage });
    // Extracting text from GenerateContentResponse using the .text property
    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("AI Chat Error:", error);
    return "I encountered an error while thinking. Please try again in a moment.";
  }
};
