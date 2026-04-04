let expenses = [];
let myChart;
let userBudget = 0;
let userEmail = "";

// --- AUTHENTICATION ---
function toggleAuth() {
    const lb = document.getElementById("loginBox"), rb = document.getElementById("registerBox");
    lb.style.display = lb.style.display === "none" ? "block" : "none";
    rb.style.display = rb.style.display === "none" ? "block" : "none";
}

function handleRegister() {
    const u = document.getElementById("regUser").value, p = document.getElementById("regPass").value;
    if(!u || !p) return alert("Please fill all fields");
    let users = JSON.parse(localStorage.getItem("finance_users") || "[]");
    if(users.find(x => x.username === u)) return alert("User already exists!");
    users.push({username: u, password: p});
    localStorage.setItem("finance_users", JSON.stringify(users));
    alert("Registration Successful!"); toggleAuth();
}

function handleLogin() {
    const u = document.getElementById("loginUser").value, p = document.getElementById("loginPass").value;
    let users = JSON.parse(localStorage.getItem("finance_users") || "[]");
    if(users.find(x => x.username === u && x.password === p)) {
        localStorage.setItem("activeUser", u); initializeApp();
    } else alert("Invalid Credentials");
}

function handleLogout() { localStorage.removeItem("activeUser"); location.reload(); }

// --- APP CORE ---
function initializeApp() {
    const user = localStorage.getItem("activeUser");
    if(!user) return;
    document.getElementById("authContainer").style.display = "none";
    document.getElementById("appContainer").style.display = "flex";
    
    // Auto Clock
    setInterval(() => { document.getElementById("dateTimeDisplay").innerText = new Date().toLocaleString(); }, 1000);

    let userData = JSON.parse(localStorage.getItem(`data_${user}`) || "{}");
    expenses = userData.expenses || [];
    userBudget = userData.budget || 0;
    userEmail = userData.email || "";
    
    document.getElementById("userNameDisplay").innerText = user;
    if(userData.pic) document.getElementById("profilePicSide").src = userData.pic;
    
    updateUI();
}

function addExpense() {
    const amt = parseFloat(document.getElementById("amount").value);
    const dsc = document.getElementById("desc").value;
    const cat = document.getElementById("category").value;
    const autoDate = new Date().toLocaleDateString();

    if(!amt || !dsc || !cat) return alert("Fill transaction details");

    expenses.push({ amount: amt, desc: dsc, date: autoDate, category: cat });
    saveData();
    updateUI();
    document.getElementById("amount").value = "";
    document.getElementById("desc").value = "";
    document.getElementById("category").value = "";
}

function deleteExp(index) {
    expenses.splice(index, 1);
    saveData();
    updateUI();
}

function saveData() {
    const user = localStorage.getItem("activeUser");
    const pic = document.getElementById("profilePicSide").src;
    localStorage.setItem(`data_${user}`, JSON.stringify({ expenses, budget: userBudget, email: userEmail, pic }));
}

function updateUI() {
    const list = document.getElementById("list");
    list.innerHTML = "";
    let total = 0, chartData = {};

    expenses.forEach((ex, i) => {
        total += ex.amount;
        chartData[ex.category] = (chartData[ex.category] || 0) + ex.amount;
        const li = document.createElement("li");
        li.className = "item";
        li.innerHTML = `<div><b>${ex.desc}</b><br><small>${ex.category} • ${ex.date}</small></div>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <b>₹${ex.amount}</b>
                            <button class="del-btn" onclick="deleteExp(${i})">🗑️</button>
                        </div>`;
        list.appendChild(li);
    });

    document.getElementById("totalDisplay").innerText = "₹" + total;
    document.getElementById("budgetDisplay").innerText = "₹" + userBudget;
    
    const status = document.getElementById("budgetStatus");
    if(userBudget > 0) {
        status.innerText = total > userBudget ? "OVER BUDGET!" : "Within Limits";
        status.style.color = total > userBudget ? "#ef4444" : "#10b981";
    }
    renderChart(chartData);
}

function renderChart(data) {
    const ctx = document.getElementById("expenseChart").getContext('2d');
    if(myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(data),
            datasets: [{ data: Object.values(data), backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] }]
        },
        options: { plugins: { legend: { position: 'bottom' } }, cutout: '70%' }
    });
}

// --- EXPORT ---
function downloadReceipt() {
    let text = `--- EXPENSE REPORT: ${localStorage.getItem("activeUser")} ---\n`;
    text += `Email: ${userEmail || 'Not Set'}\n`;
    text += `Total Spent: ₹${document.getElementById("totalDisplay").innerText}\n\n`;
    expenses.forEach(x => { text += `${x.date} | ${x.desc} [${x.category}]: ₹${x.amount}\n`; });
    text += `\nProject created by Nihal Shaikh, Atherv Autade, Yash Shinde\nGuided by: Aware Madam`;

    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "ExpenseReport.txt";
    link.click();
}

// --- SETTINGS & MODALS ---
function openModal(id) { document.getElementById(id).style.display = "block"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

function saveSettings() {
    const user = localStorage.getItem("activeUser");
    const nb = document.getElementById("setBudgetInput").value;
    const ne = document.getElementById("setEmailInput").value;
    const np = document.getElementById("picInput").value;

    if(nb) userBudget = parseFloat(nb);
    if(ne) userEmail = ne;
    if(np) document.getElementById("profilePicSide").src = np;

    saveData();
    alert("Settings Saved!");
    closeModal('settingsModal');
    updateUI();
}

window.onload = initializeApp;