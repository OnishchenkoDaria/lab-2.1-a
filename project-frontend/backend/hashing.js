const bcrypt = require('bcrypt');

async function Hashing(originalPassword) {
    if (typeof originalPassword !== 'string') {
        throw new Error('Password must be a string')
    }

     if (originalPassword.length === 0) {
        throw new Error('Password cannot be empty')
    }

    const saltRounds = 10

    return bcrypt.hash(originalPassword, saltRounds)
    .then((hashedPassword) => {
            return hashedPassword
        })

    //catching errors
    .catch((err) => {
        throw err
    })
}

module.exports = Hashing;