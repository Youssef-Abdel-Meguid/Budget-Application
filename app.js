var BudgetController = (function() {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        });
        data.totals[type] = sum;
    }

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

    return{
        addItem: function (type, description, value) {
            var newItem, ID;

            ID = 0;

            if(data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

            if(type == 'exp')
                newItem = new Expense(ID, description, value);
            else
                newItem = new Income(ID, description, value);

            data.allItems[type].push(newItem);

            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if(index != -1)
                data.allItems[type].splice(index, 1);
        },

        calculateBudget: function () {
            //1-cal the total income and expense
            calculateTotal('exp');
            calculateTotal('inc');

            //2-calc the budget
            data.budget = data.totals.inc - data.totals.exp;

            //3-calc the percentage
            if(data.totals['inc'] > 0)
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            else
                data.percentage = -1;

        },

        getbudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },

        testing: function () {
            console.log(data);
        }
    };

})();

var UIController = (function() {

    var DOMStrings = {
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputType: '.add__type',
        addBtn: '.add__btn',
        incomeList: '.income__list',
        expenseList: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        expensesPercentageLabel: '.budget__expenses--percentage',
        container: '.container'
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },

        getDOMStrings: function () {
            return DOMStrings;
        },

        addListItem: function (obj, type) {
            var html, element;

            if(type == 'inc') {
                element = DOMStrings.incomeList;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else {
                element = DOMStrings.expenseList;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            html = html.replace('%id%', obj.id);
            html = html.replace('%desc%', obj.description);
            html = html.replace('%value%', obj.value);

            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },

        deleteListItem: function (selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element); 
        },

        clearFields: function () {
            /*
            document.querySelector(DOMStrings.inputDescription).value = "";
            document.querySelector(DOMStrings.inputValue).value = "";
            */

            var inputFields, inputArray;
            inputFields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            inputArray = Array.prototype.slice.call(inputFields);
            inputArray.forEach(function (current, index, array) {
                current.value = "";
            });
            inputArray[0].focus();
        },

        dispalyBudget: function (budget) {
            document.querySelector(DOMStrings.budgetLabel).textContent = budget.budget;
            document.querySelector(DOMStrings.incomeLabel).textContent = budget.totalInc;
            document.querySelector(DOMStrings.expensesLabel).textContent = budget.totalExp;

            if(budget.percentage > 0)
                document.querySelector(DOMStrings.expensesPercentageLabel).textContent = budget.percentage + '%';
            else
                document.querySelector(DOMStrings.expensesPercentageLabel).textContent = '---';
        }
    };

})();

var controller = (function(budgetCtrl, uiCtrl) {

    var setupEventListeners = function () {
        var DOM = uiCtrl.getDOMStrings();
        document.querySelector(".add__btn").addEventListener("click", addItem);
        document.addEventListener("keypress", function (event) {
            if(event.keyCode == 13 || event.which == 13)
                addItem();
        });

        document.querySelector(DOM.container).addEventListener('click', deleteItem);
    };

    var updateBudget = function () {

        //1-Calculate the budget
        budgetCtrl.calculateBudget();

        //2-Return the budget
        var budget = budgetCtrl.getbudget();

        //3-Dispaly the budget on the UI
        uiCtrl.dispalyBudget(budget);
    }

    var addItem = function () {

        //1-Get the input data
        var input = uiCtrl.getInput();

        if(input.description != "" && input.value > 0 && !isNaN(input.value)) {
            //2-Add the item to the budget controller
            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3-Add the item to the UI controller
            uiCtrl.addListItem(newItem, input.type);

            //4-Clear input fields
            uiCtrl.clearFields();

            //5-Update the budget
            updateBudget();
        }
    }

    var deleteItem = function (event) {

        var itemId, splitId, type, id;

        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);

            //1.delete the item from the data structure
            budgetCtrl.deleteItem(type, id);

            //2.delete the item fomr UI
            uiCtrl.deleteListItem(itemId);

            //3-update and show the new budget
            updateBudget();
        }

    }

    return {
        init: function () {
            console.log("Application started");
            uiCtrl.dispalyBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(BudgetController, UIController);

controller.init();