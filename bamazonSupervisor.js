var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require('console.table');
// console.table([])

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    // options function
    menuOption();
});

function menuOption() {
    inquirer
        .prompt(
            {
                name: "choice",
                type: "list",
                message: "What option would you like to pick?",
                choices: ["View Product Sales by Department", "Create New Department"]
            }
        ).then(function (answer) {
            switch (answer.choice) {
                case "View Product Sales by Department":
                    productSales();
                    break;
                case "Create New Department":
                    newDepartment();
                    break;
            }
        });
}

function productSales() {
    connection.query("SELECT D.*, P.product_sales, P.product_sales - D.over_head_costs AS total_profit FROM departments AS D LEFT JOIN (SELECT SUM(product_sales) AS product_sales, department_name FROM products GROUP BY department_name)P ON D.department_name = P.department_name;",
     function (err, result) {
        if (err) throw err;
        var table = cTable.getTable(result);
        console.log(table);
        menuOption();
    });
}

function newDepartment() {
    // Create new department
    inquirer
        .prompt([
            {
                name: "name",
                type: "input",
                message: "What is the name of the department?"
            },
            {
                name: "cost",
                type: "input",
                message: "What is the overhead cost?",
                validate: function (value) {
                    if (isNaN(value) === false) {
                        return true;
                    }
                    return false;
                }
            }
        ])
        .then(function (answer) {
            connection.query(
                "INSERT INTO departments SET ?",
                {
                    department_name: answer.name,
                    over_head_costs: answer.cost,
                },
                function (err) {
                    if (err) throw err;
                    console.log("The new department was successfully created .");
                    // re-prompt the user for if they want to bid or post
                    menuOption();
                }
            );
        });
}
