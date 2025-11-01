// script.js
class DeepSeekChat {
    constructor(apiKey, baseURL = 'https://api.deepseek.com/v1') {
        this.apiKey = apiKey;
        this.baseURL = baseURL;
        this.conversationHistory = [];
        
        // 初始化事件监听
        this.initializeEventListeners();
    }

    // 初始化事件监听器
    initializeEventListeners() {
        // 发送按钮点击事件
        document.getElementById('send-btn').addEventListener('click', () => {
            this.sendMessage();
        });

        // 输入框回车事件
        document.getElementById('user-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 清空对话按钮
        document.getElementById('clear-btn').addEventListener('click', () => {
            this.clearConversation();
        });
    }

    // 发送消息
    async sendMessage() {
        const userInput = document.getElementById('user-input');
        const message = userInput.value.trim();

        if (!message) return;

        // 清空输入框
        userInput.value = '';

        // 添加用户消息到界面
        this.addMessageToUI('user', message);
        
        // 添加到对话历史
        this.conversationHistory.push({ role: 'user', content: message });

        // 显示加载状态
        this.showLoading();

        try {
            // 调用DeepSeek API
            const response = await this.callDeepSeekAPI();
            
            // 隐藏加载状态
            this.hideLoading();

            if (response.choices && response.choices.length > 0) {
                const assistantMessage = response.choices[0].message.content;
                
                // 添加助手回复到界面
                this.addMessageToUI('assistant', assistantMessage);
                
                // 添加到对话历史
                this.conversationHistory.push({ 
                    role: 'assistant', 
                    content: assistantMessage 
                });
            } else {
                throw new Error('No response from API');
            }
        } catch (error) {
            this.hideLoading();
            this.addMessageToUI('error', `错误: ${error.message}`);
            console.error('API调用错误:', error);
        }
    }

    // 调用DeepSeek API
    async callDeepSeekAPI() {
        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'deepseek-chat',
                messages: this.conversationHistory,
                stream: true,
                temperature: 0.7,
                max_tokens: 2048
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    // 添加消息到UI
    addMessageToUI(role, content) {
        const chatContainer = document.getElementById('chat-container');
        const messageElement = document.createElement('div');
        
        messageElement.className = `message ${role}-message`;
        
        if (role === 'user') {
            messageElement.innerHTML = `
                <div class="message-content user-content">
                    <strong>你:</strong>
                    <div>${this.escapeHtml(content)}</div>
                </div>
            `;
        } else if (role === 'assistant') {
            messageElement.innerHTML = `
                <div class="message-content assistant-content">
                    <strong>助手:</strong>
                    <div>${this.formatAssistantResponse(content)}</div>
                </div>
            `;
        } else if (role === 'error') {
            messageElement.innerHTML = `
                <div class="message-content error-content">
                    <strong>错误:</strong>
                    <div>${this.escapeHtml(content)}</div>
                </div>
            `;
        }

        chatContainer.appendChild(messageElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // 格式化助手回复（支持Markdown基础格式）
    formatAssistantResponse(content) {
        // 简单的Markdown处理
        let formatted = this.escapeHtml(content);
        
        // 粗体
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // 斜体
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // 代码块
        formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
        // 换行处理
        formatted = formatted.replace(/\n/g, '<br>');
        
        return formatted;
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 显示加载状态
    showLoading() {
        const chatContainer = document.getElementById('chat-container');
        const loadingElement = document.createElement('div');
        loadingElement.id = 'loading-indicator';
        loadingElement.className = 'message assistant-message';
        loadingElement.innerHTML = `
            <div class="message-content assistant-content">
                <strong>助手:</strong>
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatContainer.appendChild(loadingElement);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // 隐藏加载状态
    hideLoading() {
        const loadingElement = document.getElementById('loading-indicator');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    // 清空对话
    clearConversation() {
        this.conversationHistory = [];
        const chatContainer = document.getElementById('chat-container');
        chatContainer.innerHTML = '';
        
        // 可选：添加欢迎消息
        this.addMessageToUI('assistant', '你好！我是预制爱的DeepSeek助手，有什么可以帮你的吗？');
    }

    // 设置API密钥
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    // 获取对话历史
    getConversationHistory() {
        return [...this.conversationHistory];
    }

    // 设置对话历史
    setConversationHistory(history) {
        this.conversationHistory = [...history];
    }
}

// 使用示例：
// 在HTML加载完成后初始化聊天实例
document.addEventListener('DOMContentLoaded', function() {
    // 从环境变量或配置中获取API密钥
    const apiKey = 'sk-1df626259cdf4af7b117fe76dfe2aec4'; // 替换为你的实际API密钥
    
    // 创建聊天实例
    window.chatBot = new DeepSeekChat(apiKey);
    
    // 可选：添加欢迎消息
    setTimeout(() => {
        window.chatBot.addMessageToUI('assistant', '你好！我是预制爱的DeepSeek助手，有什么可以帮你的吗？');
    }, 500);
});

// 导出供其他模块使用（如果使用模块系统）
// export default DeepSeekChat;
