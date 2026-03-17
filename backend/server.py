#!/usr/bin/env python3
"""
Backend API server for Chat LLM WebUI
Supports both local model inference and API proxy to remote services
"""

import json
import yaml
from flask import Flask, request, Response, stream_with_context, jsonify
from .model_loader import ModelLoader
import torch

app = Flask(__name__)

# Load configuration
with open('../config.yaml', 'r', encoding='utf-8') as f:
    config = yaml.safe_load(f)

model = None
tokenizer = None

def init_model():
    global model, tokenizer
    loader = ModelLoader(
        model_name=config['model']['name'],
        model_path=config['model'].get('path'),
        device=config['model'].get('device', 'auto')
    )
    model, tokenizer = loader.load()

@app.route('/v1/chat/completions', methods=['POST'])
def chat_completions():
    """OpenAI-compatible chat completions API"""
    data = request.json
    messages = data.get('messages', [])
    stream = data.get('stream', False)
    temperature = data.get('temperature', config['generation'].get('temperature', 0.7))
    max_tokens = data.get('max_tokens', config['generation'].get('max_new_tokens', 2048))
    top_p = data.get('top_p', config['generation'].get('top_p', 0.8))
    
    # Build prompt
    prompt = build_prompt(messages)
    
    if stream:
        def stream_response():
            inputs = tokenizer([prompt], return_tensors="pt").to(model.device)
            
            from transformers import TextIteratorStreamer
            streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)
            
            generation_kwargs = dict(
                **inputs,
                streamer=streamer,
                max_new_tokens=max_tokens,
                temperature=temperature,
                top_p=top_p,
                do_sample=True,
                repetition_penalty=config['generation'].get('repetition_penalty', 1.1)
            )
            
            from threading import Thread
            thread = Thread(target=model.generate, kwargs=generation_kwargs)
            thread.start()
            
            for new_text in streamer:
                chunk = {
                    "id": "chatcmpl-xxx",
                    "object": "chat.completion.chunk",
                    "created": 1,
                    "model": config['model']['name'],
                    "choices": [{
                        "delta": {"content": new_text},
                        "index": 0,
                        "finish_reason": None
                    }]
                }
                yield f"data: {json.dumps(chunk)}\n\n"
        
        return Response(stream_with_context(stream_response()), mimetype='text/event-stream')
    else:
        inputs = tokenizer([prompt], return_tensors="pt").to(model.device)
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_tokens,
            temperature=temperature,
            top_p=top_p,
            do_sample=True,
            repetition_penalty=config['generation'].get('repetition_penalty', 1.1)
        )
        response_text = tokenizer.decode(outputs[0][len(inputs['input_ids'][0]):], skip_special_tokens=True)
        
        return jsonify({
            "id": "chatcmpl-xxx",
            "object": "chat.completion",
            "created": 1,
            "model": config['model']['name'],
            "choices": [{
                "message": {"role": "assistant", "content": response_text},
                "finish_reason": "stop",
                "index": 0
            }],
            "usage": {
                "prompt_tokens": len(inputs['input_ids'][0]),
                "completion_tokens": len(outputs[0]) - len(inputs['input_ids'][0]),
                "total_tokens": len(outputs[0])
            }
        })

def build_prompt(messages):
    """Build prompt from chat messages"""
    prompt = ""
    for msg in messages:
        role = msg['role']
        content = msg['content']
        if role == 'user':
            prompt += f"User: {content}\n"
        elif role == 'assistant':
            prompt += f"Assistant: {content}\n"
        elif role == 'system':
            prompt += f"System: {content}\n"
    prompt += "Assistant: "
    return prompt

@app.route('/v1/models', methods=['GET'])
def list_models():
    """List available models"""
    return jsonify({
        "data": [{
            "id": config['model']['name'],
            "object": "model",
            "created": 1,
            "owned_by": "local"
        }]
    })

if __name__ == '__main__':
    init_model()
    app.run(
        host=config.get('server', {}).get('host', '0.0.0.0'),
        port=config.get('server', {}).get('port', 5000),
        debug=config.get('server', {}).get('debug', False)
    )
