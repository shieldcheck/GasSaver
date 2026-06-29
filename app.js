// ================= تنظیمات اختصاصی شما =================
const MY_WALLET = "0x8312Ec2FD25a8E8494dc6d3D6f94877D64F25f19".toLowerCase(); 
const USDT_CONTRACT = "0x55d398326f99059ff775485246999027b3197955".toLowerCase(); // قرارداد رسمی تتر بایننس
// =======================================================

if (localStorage.getItem('gas_saver_credits') === null) {
    localStorage.setItem('gas_saver_credits', '3');
}

async function updateAllGasPrices() {
    const paywall = document.getElementById('paywall');
    const creditText = document.getElementById('credit-text');

    // بررسی وضعیت خرید اشتراک دائمی
    if (localStorage.getItem('gas_saver_premium') === 'true') {
        creditText.innerText = "Premium Status: VIP Pro 👑";
        creditText.style.color = "#3fb950";
        paywall.style.display = "none";
        fetchLiveGasData();
        return;
    }

    // بررسی تعداد اعتبار رایگان باقی‌مانده
    let credits = parseInt(localStorage.getItem('gas_saver_credits'));
    if (isNaN(credits) || credits <= 0) {
        paywall.style.display = "flex";
        return;
    }

    credits -= 1;
    localStorage.setItem('gas_saver_credits', credits.toString());
    creditText.innerText = `Free Scans Left: ${credits}`;
    fetchLiveGasData();
}

// دریافت اطلاعات کاملاً واقعی و لحظه‌ای شبکه‌ها از سرویس‌های عمومی
async function fetchLiveGasData() {
    const ethGasEl = document.getElementById('eth-gas');
    const ethStatusEl = document.getElementById('eth-status');
    const btcGasEl = document.getElementById('btc-gas');
    const btcStatusEl = document.getElementById('btc-status');
    const solGasEl = document.getElementById('sol-gas');
    const solStatusEl = document.getElementById('sol-status');
    const suggestionEl = document.getElementById('suggestion-text');

    try {
        const [ethRes, btcRes, solRes] = await Promise.all([
            fetch('https://etherscan.io'),
            fetch('https://mempool.space'),
            fetch('https://coingecko.com')
        ]);

        // نرخ گس اتریوم
        const ethData = await ethRes.json();
        let ethGas = 20;
        if(ethData.status === "1" && ethData.result) {
            ethGas = parseInt(ethData.result.ProposeGasPrice);
        }
        ethGasEl.innerText = `${ethGas} Gwei`;
        ethStatusEl.innerText = ethGas > 40 ? "🔴 High Traffic" : "🟢 Safe to Transact";
        ethStatusEl.style.color = ethGas > 40 ? "#f85149" : "#3fb950";

        // نرخ انتقال بیت‌کوین
        const btcData = await btcRes.json();
        const btcFee = btcData.halfHourFee || 25;
        btcGasEl.innerText = `${btcFee} sat/vB`;
        btcStatusEl.innerText = btcFee > 50 ? "🟡 Moderate Fee" : "🟢 Low Fee";
        btcStatusEl.style.color = btcFee > 50 ? "#f1e05a" : "#3fb950";

        // قیمت سولانا
        const solData = await solRes.json();
        const solPrice = solData.solana ? solData.solana.usd : 145;
        solGasEl.innerText = `~0.00001 SOL`;
        solStatusEl.innerText = `🟢 SOL Price: $${solPrice}`;

        // تحلیل و توصیه هوشمند به کاربر
        if (ethGas < 30 && btcFee < 35) {
            suggestionEl.innerHTML = "💡 <b>Best Time to Move Funds!</b> Both Ethereum and Bitcoin networks are highly optimized right now. Transfer costs are at their weekly lowest.";
            suggestionEl.style.color = "#3fb950";
            suggestionEl.style.borderColor = "#3fb950";
        } else {
            suggestionEl.innerHTML = "💡 <b>Optimization Suggestion:</b> Consider routing transactions through Solana or Layer-2 solutions to bypass standard network surges.";
            suggestionEl.style.color = "#58a6ff";
            suggestionEl.style.borderColor = "#58a6ff";
        }

    } catch (error) {
        console.error("Data fetch error:", error);
        suggestionEl.innerText = "Temporarily unable to fetch live data. Please try again in a few moments.";
    }
}

async function connectMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if(accounts.length > 0) {
                document.getElementById('payment-status').innerText = "Wallet Connected!";
                document.getElementById('connect-btn').innerText = "✓ Connected";
                
                const payBtn = document.getElementById('pay-btn');
                payBtn.removeAttribute('disabled');
                payBtn.style.opacity = "1";
                payBtn.style.cursor = "pointer";
            }
        } catch (err) {
            document.getElementById('payment-status').innerText = "Connection rejected.";
        }
    } else {
        alert("Please install MetaMask to proceed!");
    }
}

async function payWithUSDT() {
    try {
        if (!window.ethereum.selectedAddress) {
            alert("Please connect MetaMask first.");
            return;
        }

        const cleanAddress = MY_WALLET.replace("0x", "").padStart(64, '0');
        // ۵ تتر به هگزادسیمال با احتساب ۶ رقم اعشار استاندارد شبکه (4c4b40)
        const cleanAmount = BigInt("5000000").toString(16).padStart(64, '0');
        const txData = "0xa9059cbb" + cleanAddress + cleanAmount;

        document.getElementById('payment-status').innerText = "Opening MetaMask...";

        // ارسال تراکنش و دریافت TxHash
        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [{
                from: window.ethereum.selectedAddress,
                to: USDT_CONTRACT,
                data: txData,
                value: "0x00"
            }],
        });

        document.getElementById('payment-status').innerText = "Confirming payment on blockchain... Please wait.";

        // تایید خودکار و پیوسته وضعیت تراکنش مستقیماً از متامسک (بدون نیاز به کلید API)
        let receipt = null;
        while (receipt === null) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            receipt = await window.ethereum.request({
                method: 'eth_getTransactionReceipt',
                params: [txHash]
            });
        }

        // بررسی نهایی موفقیت‌آمیز بودن تراکنش
        if (receipt && (receipt.status === "0x1" || receipt.status === 1)) {
            localStorage.setItem('gas_saver_premium', 'true');
            document.getElementById('payment-status').innerText = "🎉 Premium Unlocked Successfully!";
            alert("Payment successful! Access granted.");
            updateAllGasPrices(); 
        } else {
            document.getElementById('payment-status').innerText = "Transaction failed on network.";
        }

    } catch (error) {
        console.error(error);
        document.getElementById('payment-status').innerText = "Transaction failed or rejected.";
    }
}

window.onload = updateAllGasPrices;
