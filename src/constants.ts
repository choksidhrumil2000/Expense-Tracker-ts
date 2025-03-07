//All the functionalities of Expense Tracker.........................................
const FUNCTIONALITIES = {
    "ADD":"add",
    "UPDATE":"update",
    "DELETE":"delete",
    "LIST":"list",
    "SUMMARY":"summary",
};

//All the Flags of Expense Tracker CLI APP....................................
const ALL_FLAGS = {
    "DESCRIPTION":'--description',
    "AMOUNT":"--amount",
    "MONTH":"--month",
    "ID":"--id",
}

//Functionality wise FlagTrack................................................
const FLAGS_TRACK = {
    [FUNCTIONALITIES.ADD]:{
        "DESCRIPTION":ALL_FLAGS.DESCRIPTION,
        "AMOUNT":ALL_FLAGS.AMOUNT,
    },
    [FUNCTIONALITIES.SUMMARY]:{
        "MONTH":ALL_FLAGS.MONTH,
    },
    [FUNCTIONALITIES.UPDATE]:{
        "ID":ALL_FLAGS.ID,
        "DESCRIPTION":ALL_FLAGS.DESCRIPTION,
        "AMOUNT":ALL_FLAGS.AMOUNT,
    },
    [FUNCTIONALITIES.DELETE]:{
        "ID":ALL_FLAGS.ID,
    }
};

//All the Commands of Expense Tracker.............................................
const COMMANDS = {
    "EXIT":"exit",
    "HELP":"help",
};

export{
    FUNCTIONALITIES,
    FLAGS_TRACK,
    COMMANDS,
    ALL_FLAGS
}