const crypto = require('crypto')

class HashService {
    async hashOtp(data) {
        return crypto.createHmac('sha256', process.env.HASH_SECRET_KEY).update(data).digest('hex');
    }
}

module.exports = new HashService();
