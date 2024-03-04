const mysql = require('mysql')
const credentials = require('./credentials')
const Hashing = require('./hashing');
var {db, connectDB, createUserTable, createOrdersTable, insertAdminByDefault} = require('./db')

const AdminUsername = credentials.username
const AdminPassword = credentials.password
const AdminEmail = credentials.email

describe('Connecting database', () => {

    afterEach(() => {
        // restore the spy created with spyOn
        jest.restoreAllMocks();   
    });
    
    test('should log "MySQL Connected" if success', () => {
        const dbMock = {
            connect: jest.fn(callback => callback(null)) //defining to return null in stead of null
        }

        // Mock spy console.log
        const spyLog = jest.spyOn(console, 'log');

        connectDB(dbMock)
        expect(spyLog).toHaveBeenCalledWith('MySQL Connected')

    })
    
    test('should return error in connection failure case', () => {
        const error = new Error('Connection error')
        const dbMock = {
            connect: jest.fn(callback => callback(error))
        };

        // Mock spy console.error
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => connectDB(dbMock)).toThrow(error);
        expect(consoleErrorSpy).toHaveBeenCalledWith('MySQL Connection Error:', error);
    })
})

describe('Creating User Table in a database', () => {
    
    beforeEach(() => {
        jest.restoreAllMocks(); // Restore mocks before each test
    });

    const dbMock = {
        query: jest.fn()
    }
    
    test('should create the users table successfully', async() => {
        dbMock.query.mockImplementation((table, callback) => {
            callback(null) //success
        })  
         // Spy on console.log
        const logSpy = jest.spyOn(console, 'log')

        createUserTable(dbMock);
        expect(dbMock.query).toHaveBeenCalledWith(
            'CREATE TABLE IF NOT EXISTS users (id int AUTO_INCREMENT, name VARCHAR (255), password VARCHAR (255), email VARCHAR (255), PRIMARY KEY(id))',
            expect.any(Function)
        )
        expect(logSpy).toHaveBeenCalledWith('users table created')
    })

    test('should throw the error beacause of users query failure', async() => {
        dbMock.query.mockImplementation((table, callback) => {
            callback(new Error('users Query execution failed')); // failure
        });

        expect(() => createUserTable(dbMock)).toThrow('users Query execution failed');
    })
})

describe('Creating Order Table in a database', () => {
    beforeEach(() => {
        jest.restoreAllMocks(); // Restore mocks before each test
    });

    const dbMock = {
        query: jest.fn()
    }
    test('should create the orders tale successfully', async() => {
        dbMock.query.mockImplementation((orders, callback) => {
            callback(null) //success
        })  
         // Spy on console.log
        const logSpy = jest.spyOn(console, 'log')

        createOrdersTable(dbMock);
        expect(dbMock.query).toHaveBeenCalledWith(
            'CREATE TABLE IF NOT EXISTS orders (id int AUTO_INCREMENT, price VARCHAR (255), email VARCHAR (255), date VARCHAR (255), PRIMARY KEY(id))',
            expect.any(Function)
        )
        expect(logSpy).toHaveBeenCalledWith('orders table created')
    })

    test('should throw the error beacause of orders query failure', async() => {
        dbMock.query.mockImplementation((orders, callback) => {
            callback(new Error('orders Query execution failed')); // failure
        });

        expect(() => createOrdersTable(dbMock)).toThrow('orders Query execution failed');
    })
})