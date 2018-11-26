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
    displayItems();
});

function displayItems() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            console.log("Item id: " + res[i].item_id + " || Product Name: " + res[i].product_name + " || Price: " + res[i].price);
        }
        buyProd()
    });
}

function buyProd() {
    inquirer
        .prompt([
            {
                name: "product",
                type: "input",
                message: "What is the ID of product you'd like to buy?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            },
            {
                name: "quantity",
                type: "input",
                message: "How many units would you like to buy?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ]).then(function (answer) {
            connection.query("SELECT stock_quantity, price, product_sales FROM products WHERE ?", { item_id: answer.product },
                function (err, res) {
                    var remainingQuant;
                    var price;
                    var sales;
                    if (res[0].stock_quantity < answer.quantity) {
                        console.log("Insufficient quantity");
                        buyProd()
                    } else {
                        // Update the database with the remaining quantity
                        remainingQuant = res[0].stock_quantity - answer.quantity;
                        price = res[0].price * answer.quantity;
                        sales = res[0].product_sales + price;

                        connection.query("UPDATE products SET ? WHERE item_id = ?",
                            [
                                {
                                    stock_quantity: remainingQuant,
                                    product_sales: sales
                                },
                                {
                                    item_id: answer.product
                                }
                            ],
                            function (err) {
                                if (err) throw err;
                                console.log("Total cost of your purchase: $" + price);
                                buyProd();
                            }
                        );
                    }
                }
            )
        });
}