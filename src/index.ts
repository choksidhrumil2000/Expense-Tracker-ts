//=============================================Expense Tracker App =====================================================

//Imports..................
import * as readline from 'readline';
import { isCommandValid } from './helper';

//GLOBAL VARIABLES................
let args:string[] = [];
let askAgain:boolean = true;

// let myJsonData = [];

const rl:readline.Interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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
        if (cmd !== 'exit') {
            askAgain = true;
        } else {
            askAgain = false;
            rl.close()
            return;
        }
    }

    //For Help Command..................................
    if (args[0] === 'help') {
        showCommandsList();
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
|==>summary - You can Summarise All the expense also can filter by month        |
|           --> --month == You can filter by month                              |
|-->example: summary --month <month>                                            |
|                                                                               |
|==>clear - You can Clear all the expense data or reset all the Data            |
|-->example: clear                                                              |  
---------------------------------------------------------------------------------`;
    console.log(str);
}