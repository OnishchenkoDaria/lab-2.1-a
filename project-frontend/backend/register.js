const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const sessions = require('express-session');

//header("Access-Control-Allow-Origin: http://localhost:5173");
//creating our mysql database + connecting it with node (next function)

const {db, connectDB, createUserTable, createOrdersTable, insertAdminByDefault} = require('./db')

connectDB(db);

//users table creation
createUserTable(db);

//orders table creation
createOrdersTable(db);

//credentials data is no longer used in router (used locally in functions)

insertAdminByDefault(db);

const registerRouter = express.Router();

const corsOptions = {
    origin: 'http://localhost:5173',
    credentials: true,  // enable passing cookies, authorization headers, etc.
    methods: 'GET, POST, PUT, DELETE',  // allow specified HTTP methods
    allowedHeaders: 'Content-Type, *',  // allow specified headers
};
registerRouter.use(cors(corsOptions));

//session implementation
const crypto = require('crypto');

const generateSecretKey = () => {
  return crypto.randomBytes(64).toString('hex');
};

registerRouter.use(
    sessions({
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 //sets cookie for 24 hours
        },
        secret:generateSecretKey(),
        resave: true,
        saveUninitialized: false,
    })
)
registerRouter.use(express.json());
registerRouter.use(express.urlencoded({ extended: true }));

registerRouter.use(bodyParser.json());

//handling user regestration
const RegisterNewUser = require('./registerPost')

registerRouter.post('/add', (req,res) => {
    RegisterNewUser(req, res)
})

//handling user log in
const LoginUser = require('./loginPost')

registerRouter.post('/log-in', (req,res) => {
    LoginUser(req, res)
})

//handles the session check
const SessionHookControl = require('./sessionHookPost')

registerRouter.post('/session-hook', (req, res) => {
    SessionHookControl(req, res)
})

//to tiny to do it outer - remains in router
//handles the role check --- for posts
registerRouter.get('/get-role', (req, res) => {
    const role = req.session.role
    if (role) {
        res.json({ role: role }); // Send the role in the response body
    } else {
        res.status(409).json({ error: 'Unauthorized' }); // Handle case where role is not set
    }
})

//handles user log out
const LogoutUser = require('./logoutPost')

registerRouter.post('/log-out', (req, res) => {
    LogoutUser(req, res)
})

//handles recording user successsful payment in database orders table
const AddUserPayment = require('./addUserPaymentPost')

registerRouter.addPayment = (price) => {
    AddUserPayment(user_email, price)
}

//handles active users all payments table data print
const getUserTable = require('./getTablePost')

registerRouter.post('/get-table', (req,res)=>{
    getUserTable(req, res)
})

//handles hashing the payment information and transfering it to liq pay
var user_email=''
const HashPaymentInfo = require('./PaymentPost')

registerRouter.post('/hashing', (req, res) => {
    user_email = req.session.email
    HashPaymentInfo(req, res)
})

module.exports = registerRouter