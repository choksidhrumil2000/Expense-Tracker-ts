//=============================================Expense Tracker App =====================================================

//Imports..................
import * as readline from 'readline';
import * as fs from 'fs';
import { giveFlagValueObject, isCommandValid, isValueValid, makeTableOfExpenses } from './helper';
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

        const flagValueObj = giveFlagValueObject(args);

        switch (args[0]) {
            case FUNCTIONALITIES.ADD:addExpense(flagValueObj);break;
            case FUNCTIONALITIES.DELETE:deleteExpense(flagValueObj);break;
            case FUNCTIONALITIES.LIST:listExpenses();break;
            case FUNCTIONALITIES.SUMMARY:summariseExpenses(flagValueObj);break;
            case FUNCTIONALITIES.UPDATE:updateExpenses(flagValueObj);break;
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
function addExpense(Flag_Value_Obj:any):void {
    if(!Flag_Value_Obj)return;
    if(!Flag_Value_Obj.hasOwnProperty(FLAGS_TRACK[FUNCTIONALITIES.UPDATE].DESCRIPTION) || 
            !Flag_Value_Obj.hasOwnProperty(FLAGS_TRACK[FUNCTIONALITIES.UPDATE].AMOUNT)){
                console.log("Amount And Description both Should be Provided by You to Add SOmething!!");
                return;
    }
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

    for(let key in Flag_Value_Obj){
        if(!isValueValid(Flag_Value_Obj[key],key)){
            return;
        }else{
            switch(key){
                case FLAGS_TRACK[FUNCTIONALITIES.ADD].DESCRIPTION:{
                    obj.description = Flag_Value_Obj[key];
                    break;
                }
                case FLAGS_TRACK[FUNCTIONALITIES.ADD].AMOUNT:{
                    obj.amount = parseInt(Flag_Value_Obj[key]);
                    break;
                }
            }
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
function deleteExpense(flagValueObj:any):void {
    if(!flagValueObj)return;
    if(!flagValueObj.hasOwnProperty(FLAGS_TRACK[FUNCTIONALITIES.DELETE].ID)){
        console.log("ID Must be Provided By You for Delete Expenses!!!");
        return;
    }
    const id:string = flagValueObj[FLAGS_TRACK[FUNCTIONALITIES.DELETE].ID!];
    if(isValueValid(id,Object.keys(flagValueObj)[0])){
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
function summariseExpenses(flagValueObj:any):void {
    if(!flagValueObj)return;

    let total_Expense = 0;
    if(flagValueObj.hasOwnProperty(FLAGS_TRACK[FUNCTIONALITIES.SUMMARY].MONTH)){
            if(isValueValid(flagValueObj[FLAGS_TRACK[FUNCTIONALITIES.SUMMARY].MONTH!],Object.keys(flagValueObj)[0])){
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

//Update Expense................................................................
function updateExpenses(Flag_Value_Obj:any) {
    if(!Flag_Value_Obj)return;
    if(!Flag_Value_Obj.hasOwnProperty(FLAGS_TRACK[FUNCTIONALITIES.UPDATE].ID)){
        console.log("Id Must be provided to update an Expense!!");
        return;
    }
    if(!isValueValid(Flag_Value_Obj[FLAGS_TRACK[FUNCTIONALITIES.UPDATE].ID!],FLAGS_TRACK[FUNCTIONALITIES.UPDATE].ID!)){
        return;
    }
    
    let isThereAnyUpdation:boolean = false;
    let id:number = 0;
    let amount:number = 0;
    let description:string = '';

    for(let key in Flag_Value_Obj){
        if(!isValueValid(Flag_Value_Obj[key],key)){
            return;
        }else{
            if(!Flag_Value_Obj.hasOwnProperty(FLAGS_TRACK[FUNCTIONALITIES.UPDATE].DESCRIPTION) && 
                !Flag_Value_Obj.hasOwnProperty(FLAGS_TRACK[FUNCTIONALITIES.UPDATE].AMOUNT)){
                    console.log("Amount Or Description Should be Provided by You to Update SOmething!!");
                    return;
            }else{
                isThereAnyUpdation = true;
            }
            
            switch(key){
                case FLAGS_TRACK[FUNCTIONALITIES.UPDATE].ID:{
                    id = parseInt(Flag_Value_Obj[key]);
                    break;
                }
                case FLAGS_TRACK[FUNCTIONALITIES.UPDATE].DESCRIPTION:{
                    description = Flag_Value_Obj[key];
                    break;
                }
                case FLAGS_TRACK[FUNCTIONALITIES.UPDATE].AMOUNT:{
                    amount = parseInt(Flag_Value_Obj[key]);
                    break;
                }
            }
        }
    }
    if(isThereAnyUpdation){
        let idx = giveIndex(id);
        if(idx === -1){
            console.log(`No Expense Found With ID:${id}`);
            return;
        }
        let oldExpenses:Expense[] = myExpenses;
        if(description)myExpenses[idx].description = description;
        if(amount)myExpenses[idx].amount = amount;
        try{
            writeDataInFile(myExpenses);
            console.log("Update Data Successfully!!!");
        }catch(e){
            //reversing the Action...............................
            console.log("Cannot Add Data in File!!");
            myExpenses = oldExpenses;
        }
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
function writeDataInFile(jsonObj:Expense[]) {
    let data = JSON.stringify(jsonObj);
    fs.writeFileSync(PATH, data);
}

//gives Index of Particular Expense.....................................
function giveIndex(id:number) {
    return myExpenses.findIndex((item)=>item.id === id);
}