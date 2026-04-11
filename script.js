const CONTRACT_ADDRESS = "0xf2410Eb96929dBD6735042C38fE4d08077107D77";
const RPC_URL = "https://bsc-dataseed1.binance.org"; // 使用官方备用节点，通常更稳定

// 背景 Canvas 动画：打造星尘微光感
function initCanvas() {
    const canvas = document.getElementById('canvas-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            // 粒子变得极其细小，像尘埃
            this.size = Math.random() * 1.2;
            this.speedX = (Math.random() - 0.5) * 0.15;
            this.speedY = (Math.random() - 0.5) * 0.15;
            this.opacity = Math.random() * 0.4;
            this.fadeSpeed = Math.random() * 0.005 + 0.002;
            this.isFadingIn = Math.random() > 0.5;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // 呼吸闪烁效果
            if (this.isFadingIn) {
                this.opacity += this.fadeSpeed;
                if (this.opacity >= 0.5) this.isFadingIn = false;
            } else {
                this.opacity -= this.fadeSpeed;
                if (this.opacity <= 0.1) this.isFadingIn = true;
            }

            if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        draw() {
            // 中心汇聚，边缘消隐的视觉处理
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const dist = Math.sqrt((this.x - centerX)**2 + (this.y - centerY)**2);
            const edgeFade = Math.max(0, 1 - dist / (canvas.width * 0.6));
            
            ctx.fillStyle = `rgba(0, 242, 255, ${this.opacity * edgeFade})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 减少粒子数量，追求克制的高级感
    for (let i = 0; i < 150; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

 
async function fetchRealData() {
    try {
        const tempProvider = new ethers.JsonRpcProvider(RPC_URL);
        const balance = await tempProvider.getBalance(CONTRACT_ADDRESS);
        const balanceBNB = ethers.formatEther(balance);
        
        const balanceElement = document.getElementById('contractBalance');
        if (balanceElement) {
            balanceElement.innerHTML = `${parseFloat(balanceBNB).toFixed(4)} <small>BNB</small>`;
        }
    } catch (error) {
        console.warn("BSC Node connection issue, retrying...");
    }
}

 
function addLog(message, type = 'system') {
    const terminal = document.getElementById('terminalBody');
    if (!terminal) return;
    const entry = document.createElement('div');
    const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `<span style="color: #4b5563; margin-right: 10px;">${time}</span> ${message}`;
    terminal.appendChild(entry);
    terminal.scrollTop = terminal.scrollHeight;
}

// 获取真实日志
async function fetchRealLogs() {
    try {
        const response = await fetch('https://api.aigenie.one/api/logs', {
            mode: 'cors',
            cache: 'no-cache'
        });
        if (!response.ok) return;
        const logs = await response.json();
        
        const terminal = document.getElementById('terminalBody');
        if (!terminal) return;
        
        terminal.innerHTML = "";
        logs.forEach(log => {
            const entry = document.createElement('div');
            entry.className = `log-entry ${log.type}`;
            entry.innerHTML = `${log.msg}`;
            terminal.appendChild(entry);
        });
        terminal.scrollTop = terminal.scrollHeight;
    } catch (error) {
        // Silently handle log fetch errors
    }
}

 
function simulateAI() {
     
    setInterval(fetchRealLogs, 5000);  

     
    setInterval(fetchRealData, 30000);
}

 
async function connect() {
    addLog("Requesting admin wallet connection...", "action");
    if (window.ethereum) {
        try {
            provider = new ethers.BrowserProvider(window.ethereum);
            signer = await provider.getSigner();
            const address = await signer.getAddress();
            
            const btn = document.getElementById('connectWallet');
            btn.innerHTML = `<i class="fas fa-check-circle"></i> ${address.substring(0, 4)}...${address.substring(38)}`;
            btn.classList.add('connected');
            
            addLog(`Admin connected: ${address}`, "success");
            document.getElementById('systemStatus').innerText = "CORE ACTIVE";
            document.getElementById('systemStatus').style.color = "#00f2ff";
        } catch (error) {
            addLog("Connection rejected by user", "warning");
        }
    } else {
        alert("Please install MetaMask!");
    }
}

 
async function checkConnection() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                provider = new ethers.BrowserProvider(window.ethereum);
                signer = await provider.getSigner();
                const address = accounts[0];
                const btn = document.getElementById('connectWallet');
                if (btn) {
                    btn.innerHTML = `<i class="fas fa-check-circle"></i> ${address.substring(0, 4)}...${address.substring(38)}`;
                    btn.classList.add('connected');
                }
                const status = document.getElementById('systemStatus');
                if (status) {
                    status.innerText = "CORE ACTIVE";
                }
            }
        } catch (err) {
            console.error("Check connection error:", err);
        }
    }
}

 
const chatToggle = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const closeChat = document.getElementById('close-chat');

if (chatToggle && chatWindow && closeChat) {
    chatToggle.onclick = () => {
        chatWindow.classList.toggle('hidden');
    };
    closeChat.onclick = () => {
        chatWindow.classList.add('hidden');
    };
}

const chatInput = document.getElementById('chat-input');
const sendChat = document.getElementById('send-chat');
const chatMessages = document.getElementById('chat-messages');
let chatHistory = []; // 用于存储对话历史

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    // 1. 显示用户消息
    appendMessage(text, 'user');
    chatInput.value = '';
    
    // 保存到历史记录
    chatHistory.push({ role: "user", content: text });
    if (chatHistory.length > 10) chatHistory.shift(); // 只保留最近10条

    // 2. 显示等待状态
    const loadingId = 'loading-' + Date.now();
    appendMessage('AI精灵正在思考...', 'bot', loadingId);

    try {
        // 发送给后端生产环境 API
        const response = await fetch('https://api.aigenie.one/api/chat', {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: text,
                history: chatHistory
            })
        });
        const data = await response.json();
        
        // 保存 AI 回复到历史
        chatHistory.push({ role: "assistant", content: data.reply });
        
        // 4. 打字机效果更新 AI 回复
        const loadingDiv = document.getElementById(loadingId);
        loadingDiv.innerText = "";  
        await typeMessage(loadingDiv, data.reply);
    } catch (error) {
        document.getElementById(loadingId).innerText = "精灵助手暂时走开了，请稍后再试。";
    }
}

 
function typeMessage(element, text, speed = 30) {
    return new Promise((resolve) => {
        let i = 0;
        function type() {
            if (i < text.length) {
                element.innerText += text.charAt(i);
                i++;
                chatMessages.scrollTop = chatMessages.scrollHeight;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}

function appendMessage(text, side, id = null) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${side}`;
    if (id) msgDiv.id = id;
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

if (sendChat && chatInput) {
    sendChat.onclick = sendMessage;
    chatInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };
}

window.onload = () => {
    initCanvas();
    simulateAI();
    fetchRealData();  
    checkConnection();
    
    addLog("AI GENIE PROTOCOL LIVE MODE", "success");
    addLog(`Monitoring Contract: ${CONTRACT_ADDRESS}`, "action");
};

document.getElementById('connectWallet').addEventListener('click', connect);