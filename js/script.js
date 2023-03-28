const Modal = {
    open(){
        //Abrir Modal
        //Adicionar a class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList.add('active');
    },
    close(){
        //Fechar Modal
        //Remover a class active ao modal
        document
            .querySelector('.modal-overlay')
            .classList.remove('active');
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || [];
    },

    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions));
    }
}


const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction);

        App.reload();
    },

    remove(index) {
        Transaction.all.splice(index, 1);

        App.reload();
    },

    incomes(){
        let income = 0;
        Transaction.all.forEach((transaction) => {
            if(transaction.amount > 0) {
                income += transaction.amount;
            }
        })
        return income;
    },

    expenses(){
        let expense = 0;
        Transaction.all.forEach((transaction) => {
            if(transaction.amount < 0) {
                expense += transaction.amount;
            }
        })
        return expense;
    },

    total(){
        //expenses has negative signal thats why we useed positive signal above
        return Transaction.incomes() + Transaction.expenses();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table'),

    addTransaction(transaction, index){
        const tr = document.createElement('tr');
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
        tr.dataset.index = index;

        DOM.transactionsContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index){
        const CSSClass = transaction.amount > 0 ? 'income' : 'expense';

        const amount = Utils.formatCurrency(transaction.amount);

        const html = `        
        <td class="description">${transaction.description}</td>
        <td class="${CSSClass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
        <img 
            onclick="Transaction.remove(${index})"
            src="/assets/minus.svg"
            alt="Imagem para eliminar Transação"
        />
        </td>       
        `

        return html
    },

    updateBalance() {
        document
        .getElementById('incomeDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.incomes());
        document
        .getElementById('expenseDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.expenses());
        document
        .getElementById('totalDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.total());

    },

    clearTransactions() {
        DOM.transactionsContainer.innerHTML = '';
    }
}

const Utils = {
    formatAmount(value) {
        //remove unnecessary characters entered by the user
        value = value * 100;
        return Math.round(value);
    },

    formatDate(date) {
        //changing default date format yyyy/mm/dd to dd/mm/yyyy
        const splittedDate = date.split('-'); //clean the (-) character
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
    },

    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-" : "+";
        value = String(value).replace(/\D/g, ''); 
        value = Number(value) / 100;
        value = value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'AKZ'
        });
        return signal + ' ' + value;
        //return value + ' ' + signal;
    }
}

const Form = {
    //getting inputs elements on HTML form
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    //getting the inputs values
    getValues() {
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        };
    },

    //Validate Fields
    validateFields() {
        //destructuring Form.values
        const {description, amount, date} = Form.getValues();        
        if(
            description.trim() === '' || 
            amount.trim() === '' || 
            date.trim() === '') {
                throw new Error('Por favor, preencha todos os campos')
        };
    },

    formatValues() {
        let {description, amount, date} = Form.getValues();

        amount = Utils.formatAmount(amount);

        date = Utils.formatDate(date);

        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = '';
        Form.amount.value = '';
        Form.date.value = '';
    },

    submit(event) {
        event.preventDefault();

        //get any error on validateFields()
        try {
            //Verify if every fields are filled
            Form.validateFields();
    
            //Format datas to be saved
            const transaction = Form.formatValues();
    
            //Save datas
            Transaction.add(transaction);

            //Clear datas on Form
            Form.clearFields()

            //Close Modal
            Modal.close();
        } catch (error) {
            alert(error.message);
        }  
    }

}

const App = {
    init(){
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index);
        });
        
        DOM.updateBalance();
        
        Storage.set(Transaction.all)
    },
    reload(){
        DOM.clearTransactions();
        App.init();
    }
}

App.init();
