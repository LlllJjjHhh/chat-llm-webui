#!/usr/bin/env python3
"""
Chat LLM WebUI - Main entry point
Simple Flask app serving the web UI and API
"""

import json
import yaml
from flask import Flask, render_template, request, stream_with_context, Response, jsonify
from transformers import AutoTokenizer, AutoModelForCausalLM, TextIteratorStreamer
import torch
from threading import Thread

app = Flask(__name__, static_folder='public', template_folder='public')

# Load config
with open('config.yaml', 'r', encoding='utf-8') as f:
    config = yaml.safe_load(f)

# Global variables for model
model = None
tokenizer = None
device = config['model'].get('device', 'cuda' if torch.cuda.is_available() else 'cpu')

def load_model():
    """Load the model and tokenizer"""
    global model, tokenizer
    
    model_name = config['model']['name']
    model_path = config['model'].get('path', model_name)
    
    print(f"Loading model: {model_name} from {model_path}")
    print(f"Device: {device}")
    
    tokenizer = AutoTokenizer.from_pretrained(model_path, trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        torch_dtype=torch.bfloat16 if device == 'cuda' else torch.float32,
        device_map=device,
        trust_remote_code=True
    )
    print("Model loaded successfully!")

@app.route('/')
def index():
    """Serve the main page"""
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    """Chat completion endpoint with streaming"""
    data = request.json
    messages = data.get('messages', [])
    temperature = data.get('temperature', config['generation'].get('temperature', 0.7))
    max_new_tokens = data.get('max_new_tokens', config['generation'].get('max_new_tokens', 2048))
    top_p = data.get('top_p', config['generation'].get('top_p', 0.8))
    
    # Build prompt from messages
    prompt = ""
    for msg in messages:
        if msg['role'] == 'user':
            prompt += f"User: {msg['content']}\n"
        else:
            prompt += f"Assistant: {msg['content']}\n"
    prompt += "Assistant: "
    
    def generate_stream():
        inputs = tokenizer([prompt], return_tensors="pt").to(device)
        
        streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)
        
        generation_kwargs = dict(
            **inputs,
            streamer=streamer,
            max_new_tokens=max_new_tokens,
            temperature=temperature,
            top_p=top_p,
            do_sample=True,
            repetition_penalty=config['generation'].get('repetition_penalty', 1.1)
        )
        
        thread = Thread(target=model.generate, kwargs=generation_kwargs)
        thread.start()
        
        for new_text in streamer:
            yield f"data: {json.dumps({'text': new_text})}\n\n"
    
    return Response(stream_with_context(generate_stream()), mimetype='text/event-stream')

@app.route('/api/config', methods=['GET'])
def get_config():
    """Get current generation config"""
    return jsonify(config['generation'])

@app.route('/api/models', methods=['GET'])
def get_model_info():
    """Get current model info"""
    return jsonify({
        'model_name': config['model']['name'],
        'device': device,
        'loaded': model is not None
    })

if __name__ == '__main__':
    # Auto-load model if configured
    if config['model'].get('auto_load', True):
        load_model()
    
    app.run(
        host=config.get('server', {}).get('host', '0.0.0.0'),
        port=config.get('server', {}).get('port', 5000),
        debug=config.get('server', {}).get('debug', False)
    )
