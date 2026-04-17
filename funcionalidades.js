let transactions = [];

try {
    transactions = JSON.parse(localStorage.getItem('transactions')) || [];
} catch (error) {
    transactions = [];
}


function escapeHtml(texto) {
    if (!texto) return '';
    return texto
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

const form = document.getElementById('formulario-transaccion');
const transactionsType = document.getElementById('tipo-transaccion');
const inputDescription = document.getElementById('descripcion');
const inputAmount = document.getElementById('monto');

//Validaciones personalizadas

//Transaccion
transactionsType.addEventListener('invalid', function(){
    if(this.value === ''){
        this.setCustomValidity('Debes seleccionar un tipo de transaccion');
    }
});

transactionsType.addEventListener('input', function(){
    this.setCustomValidity('');
})

//Descripcion, tambien evita el ingreso de simbolos, solamente se exluyen <>, ; y / \

inputDescription.addEventListener('input', function () {
    const regex = /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\(\),.'""]*$/;

    if (!this.value.trim()) {
        this.setCustomValidity('La descripción no puede estar vacía');
    } else if (!regex.test(this.value)) {
        this.setCustomValidity('Solo se permiten letras y números');
    } else {
        this.setCustomValidity('');
    }
});

//Monto

inputAmount.addEventListener('invalid', function (){
    if (!this.value){
        this.setCustomValidity('El monto es Obligatorio');
    } else if (this.value <= 0) {
        this.setCustomValidity('El monto no puede ser 0');
    }
});

inputAmount.addEventListener('input', function (){
    this.setCustomValidity('');
});



const totalBalanceSpan = document.getElementById('balance-total');
const totalEarningsSpan = document.getElementById('total-ingresos');
const totalExpensesSpan = document.getElementById('total-egresos');
const rateSpendingSpan = document.getElementById('porcentaje-gastos');

const divEarningsList = document.getElementById('lista-ingresos');
const divExpensesList = document.getElementById('lista-egresos');

// Actualizar listas y los resumenes
function updateInterface(){
    let totalEarnings = 0;
    let totalExpenses = 0;
    let rateExpenses = 0;

    transactions.forEach(trans => {
        if (trans.tipo === 'Ingreso'){
            totalEarnings += trans.monto;
        } else{
            totalExpenses += trans.monto;
        }
    });

    const balance = totalEarnings - totalExpenses;

    totalEarningsSpan.textContent = `+ ${totalEarnings.toFixed(2)}`;
    totalExpensesSpan.textContent = `- ${totalExpenses.toFixed(2)}`;
    totalBalanceSpan.textContent = `${balance >= 0 ? '+' : '-'} ${Math.abs(balance).toFixed(2)}`;

    if (totalEarnings > 0) {
        rateExpenses = (totalExpenses * 100) / totalEarnings;
    }

    rateSpendingSpan.textContent = `${rateExpenses.toFixed(2)}%`;

    updateEarningsList();
    updateExpensesList();
}

//Ingresos

function updateEarningsList() {
    const earnings = transactions.filter(trans => trans.tipo === 'Ingreso');
    
    if (earnings.length === 0) {
        divEarningsList.innerHTML = '<p class="text-center text-muted py-4">No hay ingresos registrados. ¡Agrega la primera transacción!</p>';
        return;
    }
    
    let html = '';

    earnings.forEach(earning => {
        html += `
            <div class="transaccion-item">
                <div class="d-flex justify-content-between align-items-center">
                    <strong>${escapeHtml(earning.descripcion)}</strong>
                    <span class="text-success font-weight-bold">
                        + ${earning.monto.toFixed(2)}
                    </span>
                </div>
            </div>
        `;
    });

    divEarningsList.innerHTML = html;
}

//Egresos

function updateExpensesList() {
    const expenses = transactions.filter(trans => trans.tipo === 'Egreso');
    
    let totalEarnings = 0;
    transactions.forEach(trans => {
        if (trans.tipo === 'Ingreso') {
            totalEarnings += trans.monto;
        }
    });
    
    if (expenses.length === 0) {
        divExpensesList.innerHTML = '<p class="text-center text-muted py-4">No hay egresos registrados.</p>';
        return;
    }
    
    let html = '';
    expenses.forEach(expense => {
        let rateExpenses = 0;
        if (totalEarnings > 0) {
            rateExpenses = (expense.monto * 100) / totalEarnings;
        }
        
        html += `
            <div class="transaccion-item transaccion-egreso">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${escapeHtml(expense.descripcion)}</strong>
                        <br>
                        <small class="text-muted">${rateExpenses.toFixed(2)}% del total de ingresos</small>
                    </div>
                    <span class="text-danger font-weight-bold">- ${expense.monto.toFixed(2)}</span>
                </div>
            </div>
        `;
    });
    divExpensesList.innerHTML = html;
}

function newTransaction(event){
    event.preventDefault();

    const type = transactionsType.value;
    const description = inputDescription.value.trim();
    const amount = parseFloat(inputAmount.value);


    const newTransaction = {
        id: Date.now(),
        tipo: type,
        descripcion: description,
        monto: amount,
        date: new Date()
    };

    transactions.push(newTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions)); //Guardar datos

    transactionsType.value = '';
    inputDescription.value = '';
    inputAmount.value = '';

    updateInterface();
}

form.addEventListener('submit', newTransaction);
//cargar datos
updateInterface();
