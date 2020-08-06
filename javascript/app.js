// Modular Pattern

var budgetController = (function() { // DOMAIN
    //#region Function Constructor
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calculatePercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercenatge = function() {
        return this.percentage;
    };

    // ES2015/ES6
    class Income {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }
    };
    //#endregion Function Constructor

    // Data global structure
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    var calculateTotal = function(type) {
        var sum = 0;

        data.allItems[type].forEach(function(current) {
            sum += current.value;
        });

        data.totals[type] = sum;
    };

    //#region PUBLIC Methods    
    var addItem = function (type, des, val) {
        var newItem, ID;

        // Create new ID
        if(data.allItems[type].length === 0) {
            ID = 0;
        }
        else {
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
        }

        // Create new item depending on 'type'
        if(type === 'exp') {
            newItem = new Expense(ID, des, val);
        }
        else if(type === 'inc') {
            newItem = new Income(ID, des, val);
        }

        // Push new item
        data.allItems[type].push(newItem);

        // Return newly created item
        return newItem;
    }

    var calculateBudget = function () {
        // calculate total income and expenses
        calculateTotal('inc');
        calculateTotal('exp');

        // Calculate the budget: income - expenses
        data.budget = data.totals.inc - data.totals.exp;

        // Calculate the percentage of income that we spent
        if(data.totals.inc > 0) {
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        }
        else {
            data.percentage = -1;
        }
    };

    var calculatePercentages = function() {
        data.allItems.exp.forEach((current) => {
            current.calculatePercentage(data.totals.inc);
        });
    };

    var getPercentages = function() {
        var allPerc;

        allPerc = data.allItems.exp.map(current => {
            return current.getPercenatge();
        });

        return allPerc;
    };

    var deleteItem = function(type, id) {
        var ids, index;

        ids = data.allItems[type].map((current, index, self) => {
            return current.id;
        });

        index = ids.indexOf(id);
        
        if(index !== -1) {
            data.allItems[type].splice(index,1);
        }
        
    };
    //#endregion PUBLIC Methods

    return {
        addItem,
        deleteItem,
        calculateBudget,
        calculatePercentages,
        getPercentages,
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        }
    };
})(); // IIFE

var UIController = (function() {
    // Structure to ensure minimal changes should UI change
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetlabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        conatiner: '.container',
        expExpensesPerctagesLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    //#region PRIVATE Methods
    var nodeListForEach = function(list, callback) {
        for (var i = 0; i< list.length; i++) {
            callback(list[i], i);
        }
    };

    var formatNumber = function(number, type) {
        var numSplit, int, dec, sign, formattedNumber;

        number = Math.abs(number);
        number = number.toFixed(2);

        numSplit = number.split('.');
        int = numSplit[0];
        if(int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        type === 'exp' ? sign = '-' : sign = '+';

        formattedNumber = sign + ' ' + int + '.' + dec;
        return formattedNumber;
    };
    //#endregion PRIVATE Methods

    //#region Public Methods
    var getInput = function() {
        return {
            type: document.querySelector(DOMstrings.inputType).value,
            description: document.querySelector(DOMstrings.inputDescription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
        }
    };

    var addListItem = function(obj, type) {
        var html, newHtml, element;

        // Create HTML string with placeholder text '%text%'
        if(type === 'inc') {
            element = DOMstrings.incomeContainer;

            html = '<div class="item clearfix" id="inc-%id%">';
            html += '<div class="item__description">%description%</div>';
            html += '<div class="right clearfix">';
            html += '<div class="item__value">%value%</div>';
            html += '<div class="item__delete">';
            html += '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>';
            html += '</div>';
            html += '</div>';
            html += '</div>'; 
        }
        else if(type === 'exp') {
            element = DOMstrings.expenseContainer;

            html = '<div class="item clearfix" id="exp-%id%">';
            html += '<div class="item__description">%description%</div>';
            html += '<div class="right clearfix">';
            html += '<div class="item__value">%value%</div>';
            html += '<div class="item__percentage">21%</div>'
            html += '<div class="item__delete">';
            html += '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
        }

        // Replace the placeholder text with actual text
        newHtml = html.replace('%id%', obj.id)
                    .replace('%description%', obj.description)
                    .replace('%value%', formatNumber(obj.value, type));

        // Insert the HTML into the DOM
        document.querySelector(element).insertAdjacentHTML('beforeend', newHtml)
    }

    var deleteListItem = function(selectorID) {
        var element;

        element = document.getElementById(selectorID)
        element.parentNode.removeChild(element)
    };

    var displayPercentages = function(percentages) {
        var fields;

        fields = document.querySelectorAll(DOMstrings.expExpensesPerctagesLabel);

        nodeListForEach(fields, function(current, index) {
            if(percentages[index] > 0) {
                current.textContent = percentages[index] + '%';
            }
            else {
                current.textContent = '---';
            }
        });
    };

    
    //#endregion Public Methods

    return {
        displayMonth: function() {
            var now, year, months, month;

            months = ['January', 'Feburary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month]  + ' ' + year;

        },
        changeType: function() {
            var fields,

            fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputButton).classList.toggle('red')
        },
        getInput,
        getDOMstrings: function() {
            return DOMstrings;
        },
        addListItem,
        deleteListItem,
        clearFields: function() {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current, index, array) {
                array[index].value = '';
            });

            fieldsArr[0].focus();
        },
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetlabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if(obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages
    };
})(); // IIFE

var AppController = (function(budgetCtrl, uiCtrl) {
    //#region PRIVATE
    var setupEventListeners = function() {
        var DOM = uiCtrl.getDOMstrings();

        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) { // which is for older browsers
                ctrlAddItem()
            }
        });

        // Event delegation
        document.querySelector(DOM.conatiner).addEventListener('click', cntrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', uiCtrl.changeType);
    };

    var updateBudget = function() {
        // 1. Calculate budget
        budgetCtrl.calculateBudget();

        // 2. Return budget
        var budgetData = budgetCtrl.getBudget();

        // 3. Display the budget on the UI
        uiCtrl.displayBudget(budgetData);
    };

    var updatePercentages = function() {
        var percentages;

        budgetCtrl.calculatePercentages();

        percentages = budgetCtrl.getPercentages();

        uiCtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function() {
        var input, newItem;

        // 1. Get the field input data
        input = uiCtrl.getInput();

        if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value)

            // 3. Add item to the UI
            uiCtrl.addListItem(newItem,input.type);

            // 4. Clear fields
            uiCtrl.clearFields();

            // 5. Update budget
            updateBudget();

            // 6. Update percentages
            updatePercentages();
        }

    };

    var cntrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // Delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // Delete the item from UI
            uiCtrl.deleteListItem(itemID);

            // Update and show new budget
            updateBudget();
        }
    };
    //#endregion PRIVATE

    return {
        init: function() {
            setupEventListeners();

            uiCtrl.displayMonth();
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
        }
    };
})(budgetController, UIController); // IIFE

AppController.init();