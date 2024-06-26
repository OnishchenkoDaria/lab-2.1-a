const RegisterNewUser = require('./registerPost');
const { pool } = require('../database/db');
const Hashing = require('../hashing-data/hashing');
const credentials = require('../credentials');

jest.mock('../hashing-data/hashing');
const AdminEmail = credentials.email;

describe('RegisterNewUser function', () => {
    let res, req, json, status, query, err, result;

    beforeEach(() => {
        console.log('before each')
        req = {
            session: {},
            body: {
                username: 'testname',
                userpassword: 'testpassword',
                useremail: 'test@gmail.com'
            }
        };
        status = jest.fn().mockReturnThis();
        json = jest.fn();
        res = { status, json };
    
        query = jest.fn();
        pool.query = query;
    
        err = null;
        result = [];
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should return error if the active session exists', async() => {
        req.session.user = true;
        RegisterNewUser(req, res);

        expect(status).toHaveBeenCalledWith(409);
        expect(json).toHaveBeenCalledWith({ error: 'an active session exist' });
    })

    test('should return error of failed query operation', () => {
        err = new Error('db query error');
        query.mockImplementation((_, callback) => callback(err, null));

        RegisterNewUser(req, res);

        expect(status).toHaveBeenCalledWith(500);
        expect(json).toHaveBeenCalledWith({ error: 'server error' });
    })

    test('should return error if the email was found in db', async() => {
        result = [{ useremail: 'test@gmail.com' }];
        query.mockImplementation((_, callback) => callback(null, result));

        await RegisterNewUser(req, res);

        expect(status).toHaveBeenCalledWith(409);
        expect(json).toHaveBeenCalledWith({ error: 'email in use' });
    })    

    test('should handle hashing success for user', async () => {
        // Mocking successful hashing
        Hashing.mockResolvedValueOnce('hashedPassword');

        // Mocking the database query to return no user with the input email
        query.mockImplementationOnce((_, callback) => callback(null, []));
       
        //Mocking the database to insert the user data with no error
        query.mockImplementationOnce((_, __, callback) => callback(null, result));
        await RegisterNewUser(req, res);

        expect(Hashing).toHaveBeenCalledWith('testpassword');
        expect(query).toHaveBeenCalled();
        
        //SELECT and INSERT calls
        expect(pool.query).toHaveBeenCalled();
        const { user, email, role } = req.session;
        expect(user).toBe('testname');
        expect(email).toBe('test@gmail.com');
        expect(role).toBe('user');

        expect(status).toHaveBeenCalledWith(201);
        expect(json).toHaveBeenCalledWith({ message: 'user added' });
    })
    
    test('should handle hashing successfully for admin', async() => {
        req.body.useremail = AdminEmail;
        Hashing.mockResolvedValueOnce('hashedPassword');

        // Mocking the database query to return no user with the input email
        query.mockImplementationOnce((_, callback) => callback(null, []));

        //Mocking the database to insert the user data with no error
        query.mockImplementationOnce((_, __, callback) => callback(null, result));
        await RegisterNewUser(req, res);

        expect(Hashing).toHaveBeenCalledWith('testpassword');
        expect(query).toHaveBeenCalled();
        expect(pool.query).toHaveBeenCalled();
        
        const { user, email, role } = req.session;
        expect(user).toBe('testname');
        expect(email).toBe(AdminEmail);
        expect(role).toBe('admin');

        expect(status).toHaveBeenCalledWith(201);
        expect(json).toHaveBeenCalledWith({ message: 'user added' });
    })

    test('should return error while executing INSERT query', async() => {
        err = new Error('db query error');
        Hashing.mockResolvedValueOnce('hashedPassword');

        // Mocking the database query to return no user with the input email
        query.mockImplementationOnce((_, callback) => callback(null, []));

        //Mocking the database to insert the user data with no error
        query.mockImplementationOnce((_, __, callback) => callback(err, result));
        await RegisterNewUser(req, res);
        expect(status).toHaveBeenCalledWith(500);
        expect(json).toHaveBeenCalledWith({ error: 'server error' });
    })

    test('should return error of Hashing execution', async() => {

        const errorMessage = 'Hashing error';
        const err = new Error(errorMessage);
        Hashing.mockRejectedValueOnce(err);
        query.mockImplementationOnce((_, callback) => callback(null, []));
        
        await RegisterNewUser(req, res);
        
        expect(status).toHaveBeenCalledWith(500);
        expect(json).toHaveBeenCalledWith({ error: 'hashing error' });
    })
})
