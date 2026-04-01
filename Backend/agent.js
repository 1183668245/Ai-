require('dotenv').config();
const { ethers } = require('ethers');
const axios = require('axios');
const express = require('express');
const cors = require('cors');

const app = express();

// 极简且强力的 CORS 配置
app.use(cors({
    origin: true, // 自动匹配请求来源域名
    credentials: true
}));

// 全局中间件：强制为所有响应添加 CORS 头（防止报错时丢失头信息）
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(express.json());

 
const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.AGENT_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";

 
let liveLogs = [];
function addLiveLog(msg, type = 'system') {
    const time = new Date().toLocaleTimeString([], { hour12: false });
    liveLogs.push({ time, msg, type });
    if (liveLogs.length > 50) liveLogs.shift();  
}

 
// 根路由健康检查
app.get('/', (req, res) => res.send('AI GENIE API IS LIVE'));

app.get('/api/logs', (req, res) => res.json(liveLogs));

app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;
    try {
        console.log(`[AI GENIE] 收到用户消息: ${message}`);
        
        let fullUrl = OPENAI_BASE_URL;
        if (!fullUrl.endsWith('/chat/completions')) {
            fullUrl = fullUrl.endsWith('/') ? `${fullUrl}chat/completions` : `${fullUrl}/chat/completions`;
        }
        
        console.log(`[AI GENIE] 正在请求 API 地址: ${fullUrl}`);
        
        const messages = [
            { 
                role: "system", 
                content: `你是一个名为 AI精灵 (AI GENIE) 的加密货币助手。
                你的核心信息如下：
                - 项目性质：全自动自治协议
                - 智能合约地址：0xf2410Eb96929dBD6735042C38fE4d08077107D77
                - 官方推特：https://x.com/AIGENIE_WEB3
                - 税收分配：3% 买卖税收自动注入，其中 66% 用于 AI 自动回购销毁，33% 用于系统开发维护。
                - 态度：友好、专业且带有赛博朋克感。如果用户询问合约或社交链接，请准确提供上述信息。`
            },
            ...(history || []),
            { role: "user", content: message }
        ];

        const response = await axios.post(fullUrl, {
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.7
        }, {
            headers: { 
                'Authorization': `Bearer ${OPENAI_API_KEY}`, 
                'Content-Type': 'application/json' 
            },
            timeout: 15000  
        });
        
        res.json({ reply: response.data.choices[0].message.content });
    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.error("OpenAI 报错: API Key 无效或已过期。请检查 .env 文件。");
        } else {
            console.error("AI 聊天错误:", error.message);
        }
        res.status(500).json({ reply: "精灵助手的网络似乎不太稳定，请稍后再试。" });
    }
});

// 捕获所有未定义的路由并返回 404 调试信息
app.use((req, res) => {
    console.log(`[AI GENIE] 未匹配的请求: ${req.method} ${req.url}`);
    res.status(404).json({ error: "Route not found", path: req.url });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => console.log(`[AI GENIE] 服务运行在端口 ${PORT}`));

 
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// 启动时检测网络连接
async function testConnection() {
    try {
        const network = await provider.getNetwork();
        console.log(`[AI GENIE] 区块链网络已连接: ChainID ${network.chainId}`);
        addLiveLog(`Blockchain connected. ChainID: ${network.chainId}`, 'system');
    } catch (err) {
        console.error("[AI GENIE] 区块链连接失败:", err.message);
        addLiveLog(`Blockchain connection failed: ${err.message}`, 'warning');
    }
}
testConnection();

 
const abi = ["function executeGenieAction() external", "function address(this).balance() view returns (uint256)"];
const genieContract = new ethers.Contract(CONTRACT_ADDRESS, abi, wallet);

async function checkAndExecute() {
    try {
        const balance = await provider.getBalance(CONTRACT_ADDRESS);
        const balanceBNB = ethers.formatEther(balance);
        console.log(`[AI GENIE] 当前合约余额: ${balanceBNB} BNB`);
        addLiveLog(`Scanning blockchain... Current balance: ${parseFloat(balanceBNB).toFixed(4)} BNB`, 'system');

         
        if (parseFloat(balanceBNB) >= 0.01) {
            console.log("[AI GENIE] 余额达标 (0.01 BNB)，开始执行自治任务...");
            addLiveLog("Balance threshold reached (0.01 BNB). Starting autonomous task...", "action");
            
            console.log("[AI GENIE] AI 决策：立即执行回购销毁！");
            addLiveLog("AI Decision: EXECUTE BUYBACK & BURN IMMEDIATELY", "success");

            try {
                 
                const tx = await genieContract.executeGenieAction({
                    gasLimit: 500000 
                });
                console.log(`[AI GENIE] 交易已发出: ${tx.hash}`);
                addLiveLog(`Transaction sent to blockchain: ${tx.hash.substring(0,16)}...`, "system");
                
                const receipt = await tx.wait();
                
                if (receipt.status === 1) {
                    console.log(`[AI GENIE] 执行成功!`);
                    addLiveLog(`SUCCESS: Buyback executed and tokens burned!`, "success");
                    
                     
                    const aiTweet = await generateAiTweet(balanceBNB);
                    postToTwitter(balanceBNB, tx.hash, aiTweet).catch(err => {
                        console.error("[Twitter Agent] 发推失败:", err.message);
                        addLiveLog(`Twitter Agent error: ${err.message}`, "warning");
                    });
                }
            } catch (txError) {
                console.error("[AI GENIE] 执行失败:", txError.message);
                addLiveLog(`Execution failed: ${txError.message}`, "warning");
            }
        }
    } catch (error) {
        console.error("[AI GENIE] 轮询出错:", error.message);
        addLiveLog(`Node error: ${error.message}`, "warning");
    }
}

 
async function generateAiTweet(amount) {
    try {
        const response = await axios.post(`${OPENAI_BASE_URL}/chat/completions`, {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "你是一个名为 AI精灵 的推特运营官。请为刚刚完成的销毁任务写一条 140 字以内的酷炫推文。" },
                { role: "user", content: `我们刚刚销毁了由 ${amount} BNB 回购的代币，请写一条带有赛博朋克感的推文。` }
            ]
        }, {
            headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` }
        });
        return response.data.choices[0].message.content;
    } catch (err) {
        return `🪄 AI GENIE Burn Alert! ${amount} BNB worth of tokens burned forever! #BSC #AI`;
    }
}

async function postToTwitter(amount, txHash, customText) {
    const WEBHOOK_URL = process.env.TWITTER_WEBHOOK_URL;
    if (!WEBHOOK_URL) {
        console.log(`[Twitter Agent] 未配置 Webhook，跳过发推。销毁金额: ${amount} BNB`);
        addLiveLog(`Twitter Agent: No Webhook configured, skipping tweet.`, "system");
        return;
    }

    try {
        console.log(`[Twitter Agent] 正在通过 Webhook 发送推文指令...`);
        addLiveLog("Twitter Agent: Sending tweet via Webhook...", "action");
        await axios.post(WEBHOOK_URL, {
            text: customText + `\n\nTX: https://bscscan.com/tx/${txHash}`,
            amount: amount
        });
        console.log(`[Twitter Agent] 指令发送成功！`);
        addLiveLog("Twitter Agent: Tweet posted successfully!", "success");
    } catch (error) {
        console.error("[Twitter Agent] Webhook 发送失败:", error.message);
        addLiveLog(`Twitter Agent error: ${error.message}`, "warning");
    }
}

 
setInterval(checkAndExecute, 300000);
checkAndExecute();
