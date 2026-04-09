const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const emailService = require('../services/email.service');
const mongoose = require("mongoose")

/**
 * *Create a new transaction
 * 10 step
 * 1. Validate input
 * 2.validate idempotency key
 * 3.Check account status
 * 4. Derive sender balance from ledger
 * 5. create transaction (Pending)
 * 6. Create DEBIT entry in ledger
 * 7. Create CREDIT entry in ledger
 * 8. Mark transaction as Completed
 * 9. commit MongoDB session
 * 10. Send email notification 
 */

async function createTransaction(req, res) {
  const {fromAccountId, toAccountId, amount, idempotencyKey} = req.body;


}
async function createInitialFundTransaction(req,res){

    const {toAccount, amount, idempotencyKey} = req.body;
    
    if(!toAccount || !amount || !idempotencyKey){
        return res.status(400).json({
            message: "toAccount, amount, idempotencyKey are required"
        })
    }
    const toUserAccount = await accountModel.findOne({ 
        _id: toAccount});

    if(!toUserAccount){    
        return res.status(404).json({
            message: "Invaild toAccount"
        });
    }

    const fromUserAccount = await accountModel.findOne({
        
        user: req.user._id
    });

    if(!fromUserAccount){
        return res.status(404).json({
            message: "System user account not found"
        });
    }
    
    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = new transactionModel({
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
    });

    const debitledgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        amount: amount,
        transaction: transaction._id,
        type: "DEBIT"
        
    }],{session});

    const creditedLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        amount: amount,
        transaction: transaction._id,
        type: "CREDIT"
        
    }],{session});

    transaction.status = "COMPLETED";
    await transaction.save({session});

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
        message: "Initial fund transaction created successfully",
        transactionId: transaction
    })


}

module.exports = {
    createTransaction,createInitialFundTransaction
}