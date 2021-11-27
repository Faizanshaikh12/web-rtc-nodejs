const User = require('../models/userModel');

class UserService {
    async findUser(fillter) {
        const user = await User.findOne(fillter);
        return user;
    }

    async createUser(data) {
        const user = await User.create(data);
        return user;
    }
}

module.exports = new UserService();
