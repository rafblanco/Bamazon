var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    menuOption();
});

function menuOption() {
    inquirer
        .prompt({
            name: "option",
            type: "list",
            message: "Select menu options:",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
        })
        .then(function (answer) {
            switch (answer.option) {
                case "View Products for Sale":
                    viewProds();
                    break;
                case "View Low Inventory":
                    lowInventory();
                    break;
                case "Add to Inventory":
                    addInventory();
                    break;
                case "Add New Product":
                    addProd();
                    break;
            }
        });
}

function viewProds() {
    // If a manager selects `View Products for Sale`, the app lists the item IDs, names, prices, and quantities 
    // 
    connection.query("SELECT item_id, product_name, price, stock_quantity FROM products",
        function (err, res) {
            if (err) throw err;
            for (var i = 0; i < res.length; i++) {
                console.log("Item id: " + res[i].item_id + " || Product Name: " + res[i].product_name + " || Price: " + res[i].price + " || Stock Quantity: " + res[i].stock_quantity);
            }
            menuOption();
        }
    );
}

function lowInventory() {
    // If a manager selects `View Low Inventory`, then it lists all items with an inventory count lower than five
    connection.query("SELECT item_id, product_name, stock_quantity FROM products WHERE stock_quantity < 5",
        function (err, res) {
            for (var i = 0; i < res.length; i++) {
                console.log("Item id: " + res[i].item_id + " || Product Name: " + res[i].product_name + " || Stock Quantity: " + res[i].stock_quantity);
            }
            menuOption();
        }
    );
}

function addInventory() {
    // If a manager selects `Add to Inventory`, the function will let the manager "add more" of any item currently in the store. 
    connection.query("SELECT product_name, stock_quantity FROM products", function (err, data) {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: "product",
                    type: "input",
                    message: "What item would you like to update?",
                    validate: function (input) {
                        var choiceArray = [];
                        for (var i = 0; i < data.length; i++) {
                            choiceArray.push(data[i].product_name);
                        }
                        if (choiceArray.indexOf(input) > -1) {
                            return true;
                        } else {
                            console.log("\n Item not in inventory.")
                            menuOption();
                        }
                    }
                },
                {
                    name: "amount",
                    type: "input",
                    message: "How many units would you like to add?",
                    validate: function (value) {
                        if (isNaN(value) === false) {
                            return true;
                        }
                        return false;
                    }
                }
            ])
            .then(function (results) {
                // console.log(results.product);
                var chosenItem;
                for (var i = 0; i < data.length; i++) {
                    if (data[i].product_name === results.product) {
                        chosenItem = data[i];
                    }
                }
                var newAmount = chosenItem.stock_quantity + parseInt(results.amount);

                connection.query("UPDATE products SET ? WHERE ?",
                    [
                        {
                            stock_quantity: newAmount
                        },
                        {
                            product_name: results.product
                        }
                    ], function (err, res) {
                        if (err) throw err;
                        console.log("Added inventory.");
                        menuOption();
                    }
                );
            });
    });
}

function addProd() {
    // If a manager selects `Add New Product`, the function will allow the manager to add a completely new product to the store.
    inquirer
        .prompt([
            {
                name: "product",
                type: "input",
                message: "What's the name of the product?"
            },
            {
                name: "department",
                type: "input",
                message: "What's the name of the department?"
            },
            {
                name: "price",
                type: "input",
                message: "What's the price of the product?"
            },
            {
                name: "amount",
                type: "input",
                message: "How much stock quantity would you like to add?"
            }
        ])
        .then(function (answer) {
            connection.query(
                "INSERT INTO products SET ?",
                {
                    product_name: answer.product,
                    department_name: answer.department,
                    price: answer.price,
                    stock_quantity: answer.amount
                },
                function (err) {
                    if (err) throw err;
                    console.log("New Product Added In.")
                    menuOption();
                }
            )
        }
        );
}