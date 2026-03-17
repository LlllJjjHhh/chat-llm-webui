import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, AutoModel
from typing import Tuple


class ModelLoader:
    """Generic model loader for different LLM architectures"""
    
    def __init__(self, model_name: str, model_path: str = None, device: str = "auto"):
        self.model_name = model_name
        self.model_path = model_path if model_path else model_name
        self.device = self._auto_device(device)
    
    def _auto_device(self, device: str) -> str:
        if device == "auto":
            return "cuda" if torch.cuda.is_available() else "cpu"
        return device
    
    def load(self) -> Tuple:
        """Load model and tokenizer based on model architecture"""
        
        # Detect model type
        model_lower = self.model_name.lower()
        
        tokenizer = AutoTokenizer.from_pretrained(self.model_path, trust_remote_code=True)
        
        if "chatglm" in model_lower:
            model = AutoModel.from_pretrained(
                self.model_path,
                torch_dtype=torch.bfloat16 if self.device == "cuda" else torch.float32,
                device_map=self.device,
                trust_remote_code=True
            )
        elif "qwen" in model_lower or "qwen" in model_lower:
            model = AutoModelForCausalLM.from_pretrained(
                self.model_path,
                torch_dtype=torch.bfloat16 if self.device == "cuda" else torch.float32,
                device_map=self.device,
                trust_remote_code=True
            )
        else:
            model = AutoModelForCausalLM.from_pretrained(
                self.model_path,
                torch_dtype=torch.bfloat16 if self.device == "cuda" else torch.float32,
                device_map=self.device,
                trust_remote_code=True
            )
        
        if self.device != "cpu":
            model = model.to(self.device)
        
        return model, tokenizer


def list_supported_models():
    """List all supported models"""
    return [
        "Qwen/Qwen-7B-Chat",
        "Qwen/Qwen-14B-Chat",
        "THUDM/chatglm3-6b",
        "THUDM/chatglm2-6b",
        "baichuan-inc/Baichuan2-7B-Chat",
        "baichuan-inc/Baichuan2-13B-Chat",
        "meta-llama/Llama-2-7b-chat-hf",
        "meta-llama/Meta-Llama-3-8B-Instruct",
    ]
