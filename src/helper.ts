//==============================================Helper Functions ===========================================

import { FUNCTIONALITIES, COMMANDS } from './constants';

//Check if Command is valid or Not...........................
function isCommandValid(args:string[]):boolean {
    // if (cmd === "") {
    //     console.log("****** Please Write Command!! or write 'help' *******");
    //     return true;
    // }
    if (args[0] === "") {
        console.log("****** Please Write Command!! or write 'help' *******");
        return true;
    }
    // let args = cmd.split(" ");

    for (let i = 0; i < args.length; i++) {
        if (i === 2) break;
        args[i] = args[i].toLowerCase();
    }

    if (args[0] !== "" && !COMMANDS.includes(args[0]) && !FUNCTIONALITIES.includes(args[0])) {
        console.log("ERROR: invalid Command!!");
        return false;
    }else if(FUNCTIONALITIES.includes(args[0])){
        let flags = fetchFlags(args);
        if(flags.length === 0 && args[0] !== 'list'){
            console.log("ERROR: flags are mandatory.");
            return false;
        }
    }
    return true;
}

//Fetching Flags from args.....................................
function fetchFlags(args:string[]): string[] {
    let flags:string[] = [];

    args.forEach((item)=>{
        if(item.startsWith('--')){
            flags.push(item);
        }
    });

    return flags;
}


export {
    isCommandValid
}