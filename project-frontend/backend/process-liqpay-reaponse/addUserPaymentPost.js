const {setTimeDate} = require('../set-time/setTimeDate');
const {pool} = require('../database/db');

function AddUserPayment(user_email, price) {
    const Today = setTimeDate();
    console.log(Today);
    const post = {price: price, email:user_email, date: Today};
    const sql = `INSERT INTO orders SET ?`;
    pool.query(sql,post, (err)=>{
        if (err) {
            console.error("error: ", err);
        }
        console.log('payment added!');
    })
}

module.exports = AddUserPayment