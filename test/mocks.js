jest.mock('../models/connection', () => ({
    db: jest.fn((name) => {
        if(name == 'authentication'){
            const users = [{username:'TestUser',password:'TestPass',token:'Token',answers:{domesticated_animals: {word:"dog",time:4000}, dog_breeds: {word: "beagle", time: 4000}}}, {username:'Username',password:'Password',token:'Token',answers:{domesticated_animals: {word:"dog",time:4000}, dog_breeds: {word: "beagle", time: 4000}}}]
            return {
                collection: jest.fn().mockReturnValue({
                    find: jest.fn().mockReturnValue({ 
                        toArray: jest.fn(() => users) 
                    }),
                    findOne: jest.fn((filter) => 
                        users.find((user) => {
                            if (filter.hasOwnProperty('username')) {
                                if (typeof filter.username === 'object') {
                                    const regex = new RegExp(filter.username.$regex, filter.username.$options);
                                    return regex.test(user.username);
                                }else{
                                    return user.username === filter.username;
                                }
                            }
                            return user.token === filter.token;
                        })
                    ),
                    insertOne: jest.fn(() => { acknowledged: true }),
                    updateOne: jest.fn(() => { acknowledged: true }),
                    deleteOne: jest.fn(() => { acknowledged: true }),
                    aggregate: jest.fn(() => ({
                        toArray: jest.fn(() => [
                            { } // Add something to this when testing sockets
                        ])
                    }))
                })
            }
        }
        else if(name == 'games'){
            const games = [{game:'Animals',categories:["domesticated_animals", "dog_breeds", "bird_species"]}, {game:'History',categories:["autralian_prime_ministers", "canadian_prime_ministers"]}]
            return {
                collection: jest.fn().mockReturnValue({
                    findOne: jest.fn((filter) => 
                        games.find((game) =>  game.game == filter.game)
                    ),
                })
            }
        }
        else{
            return {
                collection: jest.fn().mockReturnValue({
                    find: jest.fn().mockReturnValue({ 
                        toArray: jest.fn(() => [{word:'Cat'}, {word:'Dog'}, {word:'Cow'}, {word:'Horse'}]) 
                    }),
                    aggregate: jest.fn(() => ({
                        toArray: jest.fn(() => [
                            { } // Add something to this when testing sockets
                        ])
                    }))
                }),
                listCollections: jest.fn().mockReturnValue({
                    toArray: jest.fn(() => [{ name: 'domesticated_animals' }, { name: "dog_breeds"}, { name: "bird_species" }, { name: "autralian_prime_ministers" }, { name: "canadian_prime_ministers" }]),
                })
            }
            
        }
    })
}));

jest.mock('jsonwebtoken', () => ({
    verify: jest.fn((token, secret, callback) => {
        if (token === 'Token') {
            callback(null, { username: "TestUser" });
        }
        else if (token === 'OldToken') {
            callback(null, { username: "DeletedUser" });
        }
        else {
            callback(new Error('Token is invalid'), null);
        }
    }),
    sign: jest.fn((data, secret, expiresIn) => {
        return "Token";
    }),
}));

jest.mock('bcrypt', () => ({
    hash: jest.fn((data, saltOrRounds) => {
        return data;
    }),
    compare: jest.fn((data, encrypted) => {
        return data == encrypted;
    }),
}));