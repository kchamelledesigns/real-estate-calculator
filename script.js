let dealChart = null;
let currentUser = "";

// LOGIN
function login() {
  const email = document.getElementById('email').value.trim();
  if (!email) return alert("Enter email");

  currentUser = email;

  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('app').style.display = 'flex';

  document.getElementById('user-email').innerText = email;

  loadDeals();
}

// LOGOUT
function logout() {
  location.reload();
}

// CALCULATE
document.getElementById('calculate-btn').addEventListener('click', calculateMAO);

function calculateMAO() {
  const arv = parseFloat(document.getElementById('arv').value);
  const repairs = parseFloat(document.getElementById('repairs').value);
  const profit = parseFloat(document.getElementById('profit').value);
  const assignment = parseFloat(document.getElementById('assignment').value);
  const closing = parseFloat(document.getElementById('closing').value);

  if (isNaN(arv) || isNaN(repairs) || isNaN(profit) || isNaN(assignment) || isNaN(closing)) {
    alert("Fill all fields");
    return;
  }

  const buyerProfit = arv * (profit / 100);
  const mao = arv - repairs - buyerProfit - assignment - closing;

  document.getElementById('result').innerText = `MAO: $${mao.toFixed(2)}`;

  const deal = {
    arv,
    repairs,
    profit,
    assignment,
    closing,
    mao: mao.toFixed(2),
    date: new Date().toISOString()
  };

  const deals = JSON.parse(localStorage.getItem(currentUser)) || [];
  deals.push(deal);
  localStorage.setItem(currentUser, JSON.stringify(deals));

  showSuccess();
  renderChart(repairs, buyerProfit, assignment, closing);
  loadDeals();

  // reset inputs
  document.getElementById('arv').value = '';
  document.getElementById('repairs').value = '';
  document.getElementById('assignment').value = '';
  document.getElementById('closing').value = '';
}

// SUCCESS
function showSuccess() {
  const msg = document.getElementById('success');
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 3000);
}

// LOAD DEALS
function loadDeals() {
  const deals = JSON.parse(localStorage.getItem(currentUser)) || [];
  const list = document.getElementById('deals-list');

  list.innerHTML = '';

  deals.forEach((deal, index) => {
    const div = document.createElement('div');
    div.classList.add('deal-card');

    div.innerHTML = `
      <p>ARV: $${deal.arv}</p>
      <p>MAO: $${deal.mao}</p>
      <p>Profit: ${deal.profit}%</p>
      <p>Date: ${new Date(deal.date).toLocaleDateString()}</p>

      <div class="deal-actions">
        <button class="edit-btn" onclick="editDeal(${index})">Edit</button>
        <button class="delete-btn" onclick="deleteDeal(${index})">Delete</button>
      </div>
    `;

    list.appendChild(div);
  });

  updateStats(deals);
}

// DELETE
function deleteDeal(index) {
  let deals = JSON.parse(localStorage.getItem(currentUser)) || [];
  deals.splice(index, 1);
  localStorage.setItem(currentUser, JSON.stringify(deals));
  loadDeals();
}

// EDIT
function editDeal(index) {
  let deals = JSON.parse(localStorage.getItem(currentUser)) || [];
  const deal = deals[index];

  document.getElementById('arv').value = deal.arv;
  document.getElementById('repairs').value = deal.repairs;
  document.getElementById('profit').value = deal.profit;
  document.getElementById('assignment').value = deal.assignment;
  document.getElementById('closing').value = deal.closing;

  deals.splice(index, 1);
  localStorage.setItem(currentUser, JSON.stringify(deals));
  loadDeals();
}

// STATS
function updateStats(deals) {
  document.getElementById('total-deals').innerText = deals.length;

  const total = deals.reduce((sum, d) => sum + parseFloat(d.mao), 0);
  const avg = deals.length ? total / deals.length : 0;

  document.getElementById('avg-mao').innerText = `$${avg.toFixed(2)}`;
}

// CHART
function renderChart(repairs, profit, assignment, closing) {
  const ctx = document.getElementById('dealChart').getContext('2d');

  if (dealChart) dealChart.destroy();

  dealChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: ['Repairs', 'Profit', 'Assignment', 'Closing'],
      datasets: [{
        data: [repairs, profit, assignment, closing],
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0']
      }]
    }
  });
}