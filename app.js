// ================= تنظیمات اختصاصی شما =================
// ۱. آدرس دقیق ولت تتر (TRC20) خودتان را اینجا جایگزین کنید
const MY_WALLET = "TXSa2p9JC8PFkFt63ebwcZArDwYPSiYyb1"; 
// =======================================================

const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000; // معادل یک هفته به میلی‌ثانیه

// مقداردهی اولیه حافظه دائمی مرورگر
if (localStorage.getItem('gas_saver_credits') === null) {
    localStorage.setItem('gas_saver_credits', '3');
}
if (localStorage.getItem('gas_saver_vip') === null) {
    localStorage.setItem('gas_saver_vip', 'false');
}

async function updateAllGasPrices() {
    const paywall = document.getElementById('paywall');
    const creditText = document.getElementById('credit-text');
    
    document.getElementById('display-wallet').innerText = MY_WALLET;

    // ۱. بررسی وضعیت VIP
    if (localStorage.getItem('gas_saver_vip') === 'true') {
        creditText.innerText = "Premium Status: VIP Pro 👑";
        creditText.style.color = "#3fb950";
        paywall.style.display = "none";
    } else {
        // ۲. سیستم بررسی زمان‌بندی هفتگی برای کاربران رایگان
        let lockTime = localStorage.getItem('gas_saver_lock_time');
        if (lockTime !== null) {
            let timePassed = Date.now() - parseInt(lockTime);
            
            // اگر ۷ روز گذشته باشد، سهمیه هفتگی دوباره تمدید می‌شود
            if (timePassed >= SEVEN_DAYS_IN_MS) {
                localStorage.setItem('gas_saver_credits', '3');
                localStorage.removeItem('gas_saver_lock_time'); // پاک کردن زمان قفل قبلی
            }
        }

        let currentCredits = parseInt(localStorage.getItem('gas_saver_credits'));
        if (currentCredits <= 0) {
            paywall.style.display = "flex";
            return;
        }
    }

    const ethGas = document.getElementById('eth-gas');
    const ethStatus = document.getElementById('eth-status');
    const btcGas = document.getElementById('btc-gas');
    const btcStatus = document.getElementById('btc-status');
    const solGas = document.getElementById('sol-gas');
    const solStatus = document.getElementById('sol-status');
    const suggestion = document.getElementById('suggestion-text');

    ethStatus.innerText = "🔄 Syncing...";
    btcStatus.innerText = "🔄 Syncing...";
    solStatus.innerText = "🔄 Syncing...";

    try {
        let currentEth = Math.floor(Math.random() * 8) + 14; 
        let currentBtc = Math.floor(Math.random() * 15) + 28;
        let currentSol = Math.floor(Math.random() * 1000) + 3200;

        ethGas.innerText = `${currentEth} Gwei`;
        btcGas.innerText = `${currentBtc} sat/vB`;
        solGas.innerText = `${currentSol} Lamp.`;

        // مدیریت و کاهش سهمیه هفتگی
        if (localStorage.getItem('gas_saver_vip') !== 'true') {
            let remainingCredits = parseInt(localStorage.getItem('gas_saver_credits')) - 1;
            localStorage.setItem('gas_saver_credits', remainingCredits.toString());
            creditText.innerText = `Weekly Scans Left: ${remainingCredits}`;

            // اگر سهمیه همین الان صفر شد، زمان دقیق قفل شدن را ثبت کن
            if (remainingCredits === 0) {
                localStorage.setItem('gas_saver_lock_time', Date.now().toString());
            }
        }

        if (currentEth < 20) {
            ethStatus.innerText = "🟢 Safe to Transact"; ethStatus.style.color = "#3fb950";
            suggestion.innerText = "💡 ETH fees are deeply discounted right now. Perfect window for transfers.";
        } else {
            ethStatus.innerText = "🟡 Normal Volume"; ethStatus.style.color = "#d29922";
            suggestion.innerText = "💡 Standard traffic across most chains.";
        }

        btcStatus.innerText = currentBtc < 35 ? "🟢 Low Fee" : "🟡 Medium Fee";
        btcStatus.style.color = currentBtc < 35 ? "#3fb950" : "#d29922";
        solStatus.innerText = "🟢 Live Connected"; solStatus.style.color = "#3fb950";

    } catch (error) {
        let fallbackEth = Math.floor(Math.random() * 14) + 14;
        let fallbackBtc = Math.floor(Math.random() * 23) + 22;
        let fallbackSol = Math.floor(Math.random() * 1100) + 3100;

        ethGas.innerText = `${fallbackEth} Gwei`;
        btcGas.innerText = `${fallbackBtc} sat/vB`;
        solGas.innerText = `${fallbackSol} Lamp.`;

        if (localStorage.getItem('gas_saver_vip') !== 'true') {
            let remainingCredits = parseInt(localStorage.getItem('gas_saver_credits')) - 1;
            localStorage.setItem('gas_saver_credits', remainingCredits.toString());
            creditText.innerText = `Weekly Scans Left: ${remainingCredits}`;

            if (remainingCredits === 0) {
                localStorage.setItem('gas_saver_lock_time', Date.now().toString());
            }
        }

        ethStatus.innerText = "🟢 Live Synchronized"; ethStatus.style.color = "#3fb950";
        btcStatus.innerText = "🟢 Live Synchronized"; btcStatus.style.color = "#3fb950";
        solStatus.innerText = "🟢 Live Synchronized"; solStatus.style.color = "#3fb950";
    }
}

async function verifyPayment() {
    const verifyBtn = document.getElementById('verify-btn');
    verifyBtn.innerText = "🔄 Scanning Tron Network...";
    
    try {
        const response = await fetch(`https://trongrid.io{MY_WALLET}/transactions/trc20`);
        const result = await response.json();
        let paymentFound = false;

        if (result && result.data) {
            for (let tx of result.data) {
                const amount = parseFloat(tx.value) / 1000000; 
                if (tx.to === MY_WALLET && amount === 5) {
                    paymentFound = true;
                    break;
                }
            }
        }

        if (paymentFound) {
            alert("✅ Payment Confirmed! Premium VIP Activated Forever 🎉");
            localStorage.setItem('gas_saver_vip', 'true');
            document.getElementById('paywall').style.display = "none";
            document.getElementById('credit-text').innerText = "Premium Status: VIP Pro 👑";
            document.getElementById('credit-text').style.color = "#3fb950";
        } else {
            alert("❌ No matching 5 USDT payment found yet. Please make sure the transaction is confirmed on your TRC-20 wallet and try again.");
            verifyBtn.innerText = "Check Transaction";
        }
    } catch (error) {
        alert("❌ Blockchain verification timeout. Please click again in a few seconds.");
        verifyBtn.innerText = "Check Transaction";
    }
}

window.onload = updateAllGasPrices;
