//=============================================Expense Tracker App =====================================================

//Imports..................
import * as readline from 'readline';
import * as fs from 'fs';
import { isCommandValid, isValueValid } from './helper';
import { ALL_FLAGS, COMMANDS, FLAGS_TRACK, FUNCTIONALITIES } from './constants';
import { Expense } from './interfaces';

//GLOBAL VARIABLES................
const PATH = './src/backend/myData.json';
let args:string[] = [];
let askAgain:boolean = true;

let myExpenses:Expense[] = [];

const rl:readline.Interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//Initial Setup......................................
InitialSetup();



async function InitialSetup() {
    if (fs.existsSync(PATH)) {
        let data = await fs.readFileSync(PATH,'utf-8');
        myExpenses = JSON.parse(data.toString());
        // myExpenses.sort((a, b) => a.id - b.id);
    } else {
        await fs.writeFileSync(PATH, '[]');
        myExpenses = [];
    }
}


//Main Function Where Whole App Resides...................................................
(async function main() {

    let cmd: string = await new Promise<string>((resolve, reject) => {
        try {
            rl.question("$expense-tracker ", (inp: string) => {
                resolve(inp);
            });
        } catch (e) {
            reject("ERROR: Something Went Wrong!!");
        }
    });
    args = cmd.split(" ");

    let isValid = isCommandValid(args);
    
    if (isValid) {
        if (cmd !== COMMANDS.EXIT) {
            askAgain = true;
        } else {
            askAgain = false;
            rl.close()
            return;
        }

        //For Help Command..................................
        if (args[0] === COMMANDS.HELP) {
            showCommandsList();
        }

        switch (args[0]) {
            case FUNCTIONALITIES.ADD:addExpense(args);break;
            case FUNCTIONALITIES.DELETE:break;
            case FUNCTIONALITIES.LIST:break;
            case FUNCTIONALITIES.SUMMARY:break;
            case FUNCTIONALITIES.UPDATE:break;
            case FUNCTIONALITIES.CLEAR:clearExpenses();break;
            default:
                break;
        }
    }
   
    if (askAgain) main();
})();

//============================================ Other FUnctions ===============================================

//Show Command List......................................................
function showCommandsList():void {
    let str =
`-------------------------------------------------------------------------------
| ==>exit - For Exiting the Program                                             |
|                                                                               |
| ==>add - You can add task by using following flags(all are mandatory.)        |
|        --> --description == description of Expense                            |
|        --> --amount == how much amount you have spent                         |
|-->example: add --description <description> --amount <amount>                  |
|                                                                               |   
|==>update - You can Update Particular Expense by using one of the flag.        |
|          - You must provide an id of particular Expense.                      |
|          --> --id == id of Particular expense                                 |
|          --> --description == description of Expense                          |
|          --> --amount == how much amount you have spent                       |
|--> example: update --id <id> --description <description> --amount <amount>    |
|                                                                               |
|==>delete - You can delete a Particular Expense by providing id.               |
|-->example: delete --id <id>                                                   |
|                                                                               | 
|==>list - You can List All the expenses                                        |
|-->example: list                                                               |
|                                                                               |
|==>clear - You can Clear All the expenses                                      |
|-->example: clear                                                              |
|                                                                               |
|==>summary - You can Summarise All the expense also can filter by month        |
|           --> --month == You can filter by month                              |
|-->example: summary --month <month>                                            |
|                                                                               |
|==>clear - You can Clear all the expense data or reset all the Data            |
|-->example: clear                                                              |  
---------------------------------------------------------------------------------`;
    console.log(str);
}

//Add Expense...................................................................
function addExpense(args:string[]) {
    const today_date = new Date();
    
    const year = today_date.getFullYear();
    const month = today_date.getMonth()+1;
    const day = today_date.getDate();

    const id = getLastID(myExpenses)+1;

    const obj:Expense = {
        id:id,
        date:`${year}-${((month > 9) ? month:('0'+month))}-${((day > 9) ? day:('0'+day))}`,
        description:'',
        amount:0,
    }

    for(let i=1;i<args.length;i+=2){
        switch(args[i]){
            case FLAGS_TRACK[FUNCTIONALITIES.ADD].DESCRIPTION:{
                
                if(isValueValid(args[i+1],FLAGS_TRACK[FUNCTIONALITIES.ADD].DESCRIPTION!)){
                    obj.description = args[i+1];
                }else{
                    return;
                }
                break;
            }
            case FLAGS_TRACK[FUNCTIONALITIES.ADD].AMOUNT:{
                if(isValueValid(args[i+1],FLAGS_TRACK[FUNCTIONALITIES.ADD].AMOUNT!)){
                    obj.amount = parseInt(args[i+1]);
                }else{
                    return;
                }
                break;
            }

            default:console.log("Flag is Not Valid!!");return;
        }
    }

    myExpenses.push(obj);
    try{
        writeDataInFile(myExpenses);
        console.log(`Expense Added Successfully!! (ID:${id})`);
    }catch(e){
        //reversing the Action...............................
        console.log("Cannot Add Data in File!!");
        myExpenses.pop();
    }
}

//Clears All Expenses in file as well as Memory.........................
function clearExpenses() {
    const oldExpenses:Expense[] = myExpenses;
    const temp:Expense[] = [];
    try{
        writeDataInFile(temp);
        console.log("Clear All Data SuccessFully!!!");
    }catch(e){
        //reversing the Action...............................
        console.log("Cannot Add Data in File!!");
        myExpenses = oldExpenses;
    }
}





//gives Last ID......................................
function getLastID(expenses:Expense[]) {
    let id = 0;
    if(expenses.length !== 0){
        id = expenses[expenses.length-1].id;
    }
    return id;
}

//Write a Data to File....................................
async function writeDataInFile(jsonObj:Expense[]) {
    let data = JSON.stringify(jsonObj);
    await fs.writeFileSync(PATH, data);
}

//gives Index of Particular Expense.....................................
function giveIndex(id:number) {
    return myExpenses.findIndex((item)=>item.id === id);
}