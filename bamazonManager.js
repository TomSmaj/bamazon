var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table3');

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon"
});

function main() { 
    inquirer.prompt([{
        type: "list",
        message: "Please select what manager task you would like to perform.",
        name: "task",
        choices: ['View products for sale', 'View low inventory', 'Add to inventory', 'Add new product', 'Exit']
    } 
    ]).then(response => {
        switch(response.task){
            case 'View products for sale':
                viewProducts();
                break;
            case 'View low inventory':
                viewLowInv();
                break;
            case 'Add to inventory':
                addInv(); 
                break;
            case 'Add new product':
                addProd();
                break;
            default:
                connection.end();
                process.exit(0);
        }
    });
}



function viewProducts(){
    connection.query("SELECT * FROM products", function(err, res) { 
        if (err) throw err;

        var table = new Table({
        head: ['id', 'product name', 'department name', 'price', 'stock quantity'],
        colWidths: [5, 30, 20, 10, 16]
        });

        for(i = 0; i < res.length; i++){
            table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
        }

        console.log(table.toString());

        menuPrompt();
    });
}

function viewLowInv(){
    connection.query("SELECT * FROM products WHERE stock_quantity <= 5", function(err, res) { 
        if (err) throw err;

        var table = new Table({
        head: ['id', 'product name', 'department name', 'price', 'stock quantity'],
        colWidths: [5, 30, 20, 10, 16]
        });

        if(res.length === 0){
            table.push(["no matches", "no matches", "no matches", "no matches", "no matches"]);
        }
        else{
            for(i = 0; i < res.length; i++){
                table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
            }
        }

        console.log(table.toString());

        menuPrompt();
    });
}

function addInv(){
    connection.query("SELECT * FROM products", function(err, res) { 
        if (err) throw err;

        var table = new Table({
        head: ['id', 'product name', 'stock quantity'],
        colWidths: [5, 30, 16]
        });

        for(i = 0; i < res.length; i++){
            table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
        }
        table.push(['*', 'return to menu']);
        console.log(table.toString());

        inquirer.prompt([{
            type: "input",
            message: "Enter the id of the item you wish to increase the stock quantity of: ",
            name: "inp"
        }]).then(response => {
            if(response.inp === '*'){menuPrompt();}
            else{
                updateSQL(response.inp);
            }
        });
    });

   
}

function updateSQL(id){
    connection.query("UPDATE products SET stock_quantity = stock_quantity + 1 WHERE ?", [{item_id: id}], function(err, res) { 
        if (err) throw err;
        addInv();
    });
}

function addProd(){
    inquirer.prompt([
        {
            type: "input",
            message: "Enter the name of the new product",
            name: "pname"
        },
        {
            type: "input",
            message: "Enter the department of the new product",
            name: "dname"
        },
        {
            type: "input",
            message: "Enter the price of the new product",
            name: "price"
        },
        {
            type: "input",
            message: "Enter the initial stock of the new product",
            name: "stock"   
        }
    ]).then(response => {
        insertSQL(response.pname, response.dname, response.price, response.stock);
    });
}

function insertSQL(pname, dname, price, stock){
    connection.query("INSERT into products SET ?", 
    {
        product_name: pname,
        department_name: dname,
        price: price,
        stock_quantity: stock
    }, 
    function(err, res) { 
        if (err) throw err;
        menuPrompt();
    });
}

function  menuPrompt(){
    inquirer.prompt([{
        type: "input",
        message: "Press 'enter' to continue...",
        name: "input",
    }]).then(response => {
        main();
    });
}

main();