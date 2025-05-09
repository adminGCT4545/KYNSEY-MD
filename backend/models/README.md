# LLM Model Setup

This directory is where you should place the Llama 3.2 3B Instruct model file.

## Required Model

Place the following model file in this directory:
- Filename: `llama-3.2-3b-instruct-fp16.gguf`
- Model: Llama 3.2 3B Instruct (FP16 quantized version)
- Source: You can download the model from Hugging Face or other official sources

## Environment Configuration

You can also specify a custom path to the model file using the environment variable:
```
LLAMA_MODEL_PATH=/path/to/your/model/llama-3.2-3b-instruct-fp16.gguf
```

## Model Requirements

- The model must be the FP16 quantized version for better performance
- Make sure you have sufficient RAM available (at least 8GB recommended)
- CPU-only mode is enabled by default, but you can enable GPU acceleration by modifying the `gpuLayers` parameter in `llmService.js`

## Installation Steps

1. Download the Llama 3.2 3B Instruct model (FP16 version)
2. Place the model file in this directory
3. Ensure the filename matches exactly: `llama-3.2-3b-instruct-fp16.gguf`
4. If using a different path, set the LLAMA_MODEL_PATH environment variable

## Verification

After placing the model file and starting the server:
1. The server logs should show "[LLM] Successfully initialized Llama 3.2 3B model"
2. Test the chat functionality to ensure the model is responding properly
3. Monitor the server logs for any initialization errors
