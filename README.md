# Chat LLM WebUI

🚀 一个简洁美观的本地大模型聊天界面，支持多种开源大模型，一键启动，无需复杂配置。

![Screenshot](screenshot.png)

## ✨ 特性

- 🎨 **美观简洁的界面** - 基于React + TailwindCSS，现代化UI设计
- 🌐 **支持多种大模型** - 支持Llama 2、Qwen、ChatGLM、Baichuan等主流中文大模型
- 💬 **多对话管理** - 同时管理多个对话，随时切换，自动保存
- ⚡ **流式输出** - 打字机效果，实时响应
- 💾 **本地对话保存** - 所有对话存储在浏览器本地存储，保护隐私
- 🎯 **可配置模型参数** - 温度、最大生成长度、top_p、重复惩罚等参数可调
- 🌓  **深色/浅色主题** - 支持深色浅色主题切换，保护眼睛
- 📱 **响应式设计** - 支持手机、平板、桌面多种设备
- 🔒 **完全本地运行** - 数据不出本地，保护隐私

## 🚀 快速开始

### 方式一：Python + Flask后端（简单版）

```bash
# 克隆项目
git clone https://github.com/LlllJjjHhh/chat-llm-webui.git
cd chat-llm-webui

# 安装依赖
pip install -r requirements.txt

# 下载模型（可选，使用OpenAI API也可以）
# 例如下载Qwen-7B-Chat: https://huggingface.co/Qwen/Qwen-7B-Chat

# 启动服务
python app.py

# 打开浏览器访问 http://localhost:5000
```

### 方式二：完整前后端分离

```bash
# 前端
cd frontend
npm install
npm run build

# 后端
cd ../backend
pip install -r requirements.txt
python server.py
```

## 📖 支持的模型

| 模型 | 本地部署 | API调用 | 说明 |
|------|----------|---------|------|
| Qwen (通义千问) | ✅ | ✅ | 优秀的中文能力 |
| ChatGLM3 | ✅ | ✅ | 清华开源，轻量高效 |
| Llama 2 / Llama 3 | ✅ | ✅ | Meta开源 |
| Baichuan (百川) | ✅ | ✅ | 优秀中文大模型 |
| OpenAI GPT | ❌ | ✅ | 通过API调用 |
| Claude | ❌ | ✅ | 通过API调用 |

## 🎮 使用示例

### 本地调用Qwen模型

```python
from backend.model_loader import ModelLoader

loader = ModelLoader(model_name="Qwen/Qwen-7B-Chat")
model, tokenizer = loader.load()

response = model.chat(tokenizer, "你好，请介绍一下你自己", history=[])
print(response)
```

## ⚙️ 配置

在 `config.yaml` 中配置模型路径和参数：

```yaml
model:
  name: "Qwen/Qwen-7B-Chat"
  path: "./models/Qwen-7B-Chat"
  device: "cuda"  # or "cpu"

generation:
  temperature: 0.7
  max_new_tokens: 2048
  top_p: 0.8
  repetition_penalty: 1.1
```

## 🖼️ 界面预览

打开项目就能看到，界面包含：
- 左侧对话历史栏
- 中间聊天区域
- 右侧参数配置面板
- 深色/浅色主题切换

## 🛠️ 技术栈

- **后端**: Python, Flask, transformers, torch
- **前端**: React, TailwindCSS, Vite
- **流式响应**: Server-Sent Events (SSE)

## 📝 许可证

MIT

---

If this project helped you, buy me a coffee ☕

<img src="Qrcode.jpg" alt="Buy Me A Coffee" width="300">
