import fetch from 'node-fetch';

class LLMService {
    constructor() {
    this.apiUrl = 'http://localhost:11434/api/generate';
    this.model = 'llama3.2:3b-instruct-fp16';
    }

    async initialize() {
        try {
            // Test connection to Ollama API
            const response = await fetch('http://localhost:11434/api/health');
            if (!response.ok) {
                throw new Error('Ollama API not available');
            }
            console.log('[LLM] Successfully connected to Ollama API');
            return true;
        } catch (error) {
            console.error('[LLM] Error initializing model:', error);
            return false;
        }
    }

    async generateResponse(userMessage, context = {}) {
        try {
            const messageWithContext = context.selectedTrain
                ? `[Train: ${context.selectedTrain}] ${userMessage}`
                : userMessage;

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: this.model,
                    prompt: `You are a helpful AI assistant specialized in train operations and management. Your responses should be clear, professional, and focused on helping users with their train-related queries.

${messageWithContext}`,
                    stream: false
                })
            });

            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('[LLM] Error generating response:', error);
            throw error;
        }
    }
}

// Create and export a singleton instance
const llmService = new LLMService();
export default llmService;
