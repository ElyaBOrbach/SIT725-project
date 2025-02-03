const request = require('supertest');
const http = require('../server'); 
const db = require('../models/user'); 

jest.mock('../models/user');
module.exports = () => {
describe('User Controller - postUser', () => {
  afterAll(() => {
    http.close();
  });

  it('should register a new user successfully', async () => {
    db.postUser.mockImplementation((user, callback) => {
      callback(null, { username: user.username });
    });

    const response = await request(http)
      .post('/api/user/signup')
      .send({ username: 'lola', password: 'password123' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      data: { username: 'lola' },
      message: 'New user registered',
    });
  });

  it('should return 400 if username or password is missing', async () => {
    const response = await request(http)
      .post('/api/user/signup')
      .send({ username: '' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'Username or password is missing',
    });
  });

  it('should return 409 if the user already exists', async () => {
    db.postUser.mockImplementation((user, callback) => {
      callback({ message: 'User already exists' }, null);
    });

    const response = await request(http)
      .post('/api/user/signup')
      .send({ username: 'existinguser', password: 'password123' });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      message: 'User already exists',
    });
  });

  it('should return 500 if there is a server error', async () => {
    db.postUser.mockImplementation((user, callback) => {
      callback({ message: 'Error inserting user' }, null);
    });

    const response = await request(http)
      .post('/api/user/signup')
      .send({ username: 'lola', password: 'password123' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: 'Error inserting user',
    });
  });
});
}


