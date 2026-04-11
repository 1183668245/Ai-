require('dotenv').config();
const axios = require('axios');

async function sendTest() {
    const url = process.env.TWITTER_WEBHOOK_URL;
    if (!url) {
        console.error("错误：.env 中没有找到 TWITTER_WEBHOOK_URL");
        return;
    }
    
    console.log("正在向 Webhook 发送测试信号...");
    try {
        await axios.post(url, {
            text: "🪄 AI精灵 (AI GENIE) 自动发推测试成功！ #AI #BSC #GENIE",
            amount: "0.01",
            hash: "0x1234567890abcdef"
        });
        console.log("✅ 信号发送成功！请查看 Make.com 页面。");
    } catch (error) {
        console.error("❌ 发送失败:", error.message);
    }
}

sendTest();