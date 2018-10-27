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

function main(){
var table = new Table({
    head: ['id', 'product name', 'department name', 'price', 'stock quantity'],
    colWidths: [5, 30, 20, 10, 16]
});

    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        for(i = 0; i < res.length; i++){
            table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
        }
        console.log(table.toString());    
        prompt();
        //connection.end();
    });
    
}

function prompt(){
    inquirer.prompt([{
        type: "input",
        message: "What is the id of the item you would like to buy?",
        name: "item_id"
    }, 
    {
        type: "input",
        message: "What quantity would you like to buy?",
        name: "quantity"
    }]).then(response => {
        console.log("res item_id: " + response.item_id);
        console.log("res quantity: " + response.quantity);
        checkIfValid(parseInt(response.item_id), parseInt(response.quantity));
        
    });
}

function checkIfValid(id, q){
    let v = false;
    connection.query("SELECT * FROM products WHERE ?", {item_id: id}, function(err, res) {
        if (err) throw err;
        console.log("stock: " + res[0].stock_quantity);
        console.log("quantity: " + q);
        if(parseInt(res[0].stock_quantity) >= q){
            fillOrder(id, q);
        }
        else{
            console.log("Insufficient quantity!");
        }
    });
}

function fillOrder(id, q){
    let currentQuantity = 0;
    price = 0;
    connection.query("SELECT * FROM products WHERE ?", {item_id: id}, function(err, res) {
        if (err) throw err;
        currentQuantity = res[0].stock_quantity;
        price = res[0].price;
        console.log("Cost of purchase: " + (price * q));
        updateTable(currentQuantity, q, id);
    });
}

function updateTable(cQ, q, id){
    let nQ = cQ - q;
    connection.query("UPDATE products SET ? WHERE ?", [{stock_quantity:nQ},{item_id: id}], function(err, res) {
        if (err) throw err;
        connection.end();
        return;
    });
}    

main();