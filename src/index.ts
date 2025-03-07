//=============================================Expense Tracker App =====================================================

//Imports..................
import * as readline from 'readline';
import * as fs from 'fs';
import { isCommandValid, isValueValid, makeTableOfExpenses } from './helper';
import { COMMANDS, FLAGS_TRACK, FUNCTIONALITIES, MONTH } from './constants';
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
            case FUNCTIONALITIES.DELETE:deleteExpense(args);break;
            case FUNCTIONALITIES.LIST:listExpenses();break;
            case FUNCTIONALITIES.SUMMARY:summariseExpenses(args);break;
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
|-->example: summary                                            |
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
        let i=1;
        switch(args[i]){
            case FLAGS_TRACK[FUNCTIONALITIES.ADD].DESCRIPTION:{
                
                if(args[i+1]){
                    if(isValueValid(args[i+1],FLAGS_TRACK[FUNCTIONALITIES.ADD].DESCRIPTION!)){
                        obj.description = args[i+1];
                        if(args[i+3]){
                            if(isValueValid(args[i+3],FLAGS_TRACK[FUNCTIONALITIES.ADD].AMOUNT!)){
                                obj.amount = parseInt(args[i+3]);    
                            }else{
                                return;
                            }
                        }else{
                            console.log("Amount Should be Provided By User!!");
                            return;
                        }   
                    }else{
                        return;
                    }
                }else{
                    console.log("Descripiton Should Be Provided By User!!!");
                    return;
                }
                break;
            }
            case FLAGS_TRACK[FUNCTIONALITIES.ADD].AMOUNT:{

                if(args[i+1]){
                    if(isValueValid(args[i+1],FLAGS_TRACK[FUNCTIONALITIES.ADD].AMOUNT!)){
                        obj.amount = parseInt(args[i+1]);    
                        if(args[i+3]){
                            if(isValueValid(args[i+3],FLAGS_TRACK[FUNCTIONALITIES.ADD].DESCRIPTION!)){
                                obj.description = args[i+3];
                            }else{
                                return;
                            }
                        }else{
                            console.log("Description Should be Provided By User!!");
                            return;
                        }   
                    }else{
                        return;
                    }
                }else{
                    console.log("Amount Should Be Provided By User!!!");
                    return;
                }
                break;
            }

            default:console.log("Flag is Not Valid!!");return;
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

//List All the Expenses..............................
function listExpenses():void {
    if(myExpenses.length === 0){
        console.log("No Expenses !!!");
        return;
    }
    const str = `----------------------------------------------------------------`;
    console.log(str);
    makeTableOfExpenses(myExpenses);
    console.log(str);
}

//Delete a Particular Expense..........................................
function deleteExpense(args:string[]):void {
    const id:string = args[2];
    if(isValueValid(id,args[1])){
        const idx = giveIndex(parseInt(id));
        if(idx === -1){
            console.log("Expense Not Found!!");
            return;
        }

        const oldExpense:Expense = myExpenses.slice(idx,idx+1)[0];
        myExpenses.splice(idx,1);
        try{
            writeDataInFile(myExpenses);
            console.log("Expense Deleted Successfully!!");
        }catch(e){
            //reversing the Action...............................
            console.log("Cannot Add Data in File!!");
            myExpenses.push(oldExpense); 
            myExpenses.sort((a,b)=>a.id-b.id);
        }

    }
}

//Summarise Expenses..................................................
function summariseExpenses(args:string[]):void {
    let total_Expense = 0;
    if(args[1]){
        if(isValueValid(args[2],FLAGS_TRACK[FUNCTIONALITIES.SUMMARY].MONTH!)){
            const month = parseInt(args[2]);
            const filtered_expenses = myExpenses.filter((item)=>{
                const curr_month = parseInt(item.date.split('-')[1]);
                return curr_month === month;
            });
            total_Expense = filtered_expenses.reduce((acc,item)=>acc+item.amount,0);
            console.log(`Total Expenses of month ${MONTH[month-1]} is : ${total_Expense}`);
        }else{
            return;
        }
    }else{
        total_Expense = myExpenses.reduce((acc,item)=>acc+item.amount,0);
        console.log(`Total Expenses: ${total_Expense}`);
    }

}

//Clears All Expenses in file as well as Memory.........................
function clearExpenses():void {
    const oldExpenses:Expense[] = myExpenses;
    const temp:Expense[] = [];
    myExpenses = temp;
    try{
        writeDataInFile(myExpenses);
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