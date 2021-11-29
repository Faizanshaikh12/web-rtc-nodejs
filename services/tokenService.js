const jwt = require('jsonwebtoken')
const Refresh = require('../models/refreshModel')

const accessTokenSecret = process.env.JWT_ACCESS_SECRET;
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;

class TokenService {
    //AccessToken and RefreshToken
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, accessTokenSecret, {
            expiresIn: '1m',
        });
        const refreshToken = jwt.sign(payload, refreshTokenSecret, {
            expiresIn: '1y',
        });
        return { accessToken, refreshToken };
    }

     //Refresh token store in database
    async storeRefreshToken(token, userId){
        try{
          await Refresh.create({
                token,
                userId
            })
        } catch(err){
            console.log(err)
        }
    }

    //Verify Access Token
    async verifyAccessToken(token) {
        return jwt.verify(token, accessTokenSecret);
    }

}

module.exports = new TokenService();
