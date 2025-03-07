//==============================================Helper Functions ===========================================

import { FUNCTIONALITIES, COMMANDS, FLAGS_TRACK, ALL_FLAGS } from './constants';
import { Expense } from './interfaces';

//Check if Command is valid or Not...........................
function isCommandValid(args:string[]):boolean {

    if (args[0] === "") {
        console.log("****** Please Write Command!! or write 'help' *******");
        return true;
    }

    for (let i = 0; i < args.length; i++) {
        if (i === 2) break;
        args[i] = args[i].toLowerCase();
    }

    const functionalities_arr = Object.values(FUNCTIONALITIES);
    const commands_arr = Object.values(COMMANDS);
    let flags_arr = fetchUserFlags(args);

    if (args[0] !== "" && !commands_arr.includes(args[0]) && !functionalities_arr.includes(args[0])) {
        console.log("ERROR: invalid Command!!");
        return false;
    }else if(functionalities_arr.includes(args[0])){
        

        // if(flags_arr.length === 0 && args[0] !== FUNCTIONALITIES.LIST && args[0] !== FUNCTIONALITIES.CLEAR){
        //     console.log("ERROR: flags are mandatory.");
        //     return false;
        // }
        if(flags_arr.length === 0 && (args[0] === FUNCTIONALITIES.ADD || args[0] === FUNCTIONALITIES.UPDATE || args[0] === FUNCTIONALITIES.DELETE)){
            console.log(`ERROR: flags are mandatory for ${args[0]}.`);
            return false;
        }
        let isSequenceValid = writtenCmdSequenceValidOrNot(args);
        if(!isSequenceValid){
            console.log("Something's Wrong with the command Sequence Kindly check or take help of help command!!");
            return false;
        }
        if(isSequenceValid && !areFlagsValid(flags_arr,args[0])){
            console.log("Something is wrong with flags kindly check or take help of 'help' commmand!!");
            return false;
        }
        // if(isSequenceValid && !checkOrGiveFlagValueObject(flags_arr,args[0])){
        //     // console.log("Something is wrong with flags kindly check or take help of 'help' commmand!!");
        //     return false;
        // }
        
    }
    return true;
}

//Fetching Flags which user has given in command.....................................
function fetchUserFlags(args:string[]): string[] {
    let flags:string[] = [];


    args.forEach((item,i)=>{
        if(i!==0 && item.startsWith('--')){
            flags.push(item);
        }
    });

    return flags;
}

//Give FlagValue Object...........................................
function giveFlagValueObject(args:string[]):any{
    const obj:any = {};
    const flags:string[] = [];
    const values:string[] = [];

    args.forEach((item,i)=>{
        if(i>0){
            if(item.startsWith('--')){
                flags.push(item);
            }else{
                values.push(item);
            }
        }  
    });

    if(flags.length === values.length){
        for(let i=0,j=0;i<flags.length && j<values.length;i++,j++){
            obj[flags[i]] = values[i];
        }
    }else if(flags.length < values.length || flags.length > values.length){
        console.log("Something's Wrong with command kindly take help of help command!!");
        return false;
    }    
    return obj;

}

//checks if flag Sequence is Valid or not.....................................
function writtenCmdSequenceValidOrNot(args:string[]):boolean {
    for(let i=1;i<args.length;i++){
        if(i%2 !== 0){
            if(!args[i].startsWith('--') ){
                return false;
            }
        }else{
            if(args[i].startsWith('--')){
                return false;
            }
        }
        
    }    
    return true;
}

//check Flags are Valid or not ...........................
function areFlagsValid(user_flags_arr:string[],func:string):boolean {

    const inbuilt_flags_arr = Object.values(FLAGS_TRACK[func]);
    for(let i=0;i<user_flags_arr.length;i++){
        if(!inbuilt_flags_arr.includes(user_flags_arr[i]))return false;
    }

    return true;
}

//Check If Provided ValueType is Valid or Not.........................................
function isValueTypeValid(val:string,flag:string):boolean{
    switch(flag){
        case ALL_FLAGS.DESCRIPTION:{
            if(isNaN(parseInt(val))){
                return true;
            }else{
                console.log("ERROR: Description Should be text or alphanumeric")
                return false;
            }
        }
        case ALL_FLAGS.AMOUNT:{
            if(isNaN(parseInt(val))){
                console.log("ERROR: Amount Should be Number!!");
                return false;
            }else{
                return true;
            }
        }
        case ALL_FLAGS.ID:{
            if(isNaN(parseInt(val))){
                console.log("ERROR: Id Should be Number!!");
                return false;
            }else{
                return true;
            }
        }
        case ALL_FLAGS.MONTH:{
            if(isNaN(parseInt(val))){
                console.log("ERROR: Month SHould be Number!!");
                return false;
            }else{
                return true;
            }
        }
        default:{
            console.log("Flag is Not Valid!!!");
            return false;
        }
    }
}

//Check If Provided Value is Valid or Not.........................................
function isValueValid(val:string,flag:string):boolean{

    if(isValueTypeValid(val,flag)){
        switch(flag){
            case ALL_FLAGS.DESCRIPTION:{
                return isDescriptionValid(val);
            }
            case ALL_FLAGS.AMOUNT:{
                return isAmountValid(parseInt(val));
            }
            case ALL_FLAGS.ID:{
                // return isIdValid(val);
                return true;
            }
            case ALL_FLAGS.MONTH:{
                return isMonthValid(val);
            }
            default:{
                console.log("Flag is Not Valid!!!");
                return false;
            }
        }    
    }else{
        console.log(`ERROR: Value Type of ${flag} is not Valid!!`);
        return false;
    }
    
}

//checks if Description's value is Valid or not....................................
function isDescriptionValid(val:string){
    const in_built_flags = Object.values(ALL_FLAGS);

    if(in_built_flags.includes(val) || val.startsWith('-')){
        console.log("description is Not Valid!!");
        return false;
    }else{
        return true;
    }
}

//checks if Amount's value is Valid or not....................................
function isAmountValid(val:number){
    //In Additional Feature: Budget Setting : We will check if Amount is Valid or Not
    return true;
}

//checks if ID's value is Valid or not....................................
// function isIdValid(val:string){
//     // Maybe In Future Use..........................
//     
// }

//checks if ID's value is Valid or not....................................
function isMonthValid(val:string){
    const month = parseInt(val);
    if(!(month >=1 && month <=12)){
        console.log("Given Month is NOt Valid!! Try Again!!");
        return false;
    }
    return true;
}

//makes Table of Expenses................
function makeTableOfExpenses(expenses:Expense[]):void{
    console.log('#ID\t Date\t \tDescription\t Amount');
    expenses.forEach((item)=>{
        console.log(`#${item.id}\t ${item.date}\t ${item.description}\t \t${item.amount}`);
    });
}



export {
    isCommandValid,
    isValueValid,
    makeTableOfExpenses,
    giveFlagValueObject
}