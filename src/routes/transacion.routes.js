const {Router} = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const transactionController = require("../controllers/transaction.controller");


const transactionRouter = Router();

// POST /api/transactions/ and create new transaction 
transactionRouter.post('/',authMiddleware.authMiddleware, transactionController.createTransaction);

// POST /api/transactions/system/initial-fund and create initial funds from system user
transactionRouter.post('/system/initial-funds',authMiddleware.authSystemUserMiddleware, transactionController.createInitialFundTransaction);


module.exports = transactionRouter;