const otpService = require('../services/otpService')
const hashService = require('../services/hashService')
const userService = require('../services/userService')
const tokenService = require('../services/tokenService')
const UserDto = require('../dtos/userDto')

class AuthController {
    async sendOtp(req, res) {
        const {phone} = req.body;
        if (!phone) {
            res.status(400).json({message: 'Phone field is required!'});
        }

        const otp = await otpService.generateOtp();

        const ttl = 1000 * 60 * 2; // 2 min
        const expires = Date.now() + ttl;
        const data = `${phone}.${otp}.${expires}`;
        const hash = hashService.hashOtp(data);

        // send OTP
        try {
            // await otpService.smsOtp(phone, otp);
            res.json({
                hash: `${hash}.${expires}`,
                phone,
                otp,
            });
        } catch (err) {
            console.log(err);
            res.status(500).json({message: 'message sending failed'});
        }
    }

    async verifyOtp(req, res) {
        const {otp, hash, phone} = req.body;
        if (!otp || !hash || !phone) {
            res.status(400).json({message: 'All fields are required!'});
        }

        const [hashedOtp, expires] = hash.split('.');
        if (Date.now() > +expires) {
            res.status(400).json({message: 'OTP expired!'});
        }

        const data = `${phone}.${otp}.${expires}`;
        const isValid = otpService.verifyOtp(hashedOtp, data);
        if (!isValid) {
            res.status(400).json({message: 'Invalid OTP'});
        }

        let user;
        try {
            user = await userService.findUser({phone});
            if (!user) {
                user = await userService.createUser({phone});
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({message: 'Db error'});
        }

        const {accessToken, refreshToken} = tokenService.generateTokens({
            _id: user._id,
            activated: false,
        });

        //storing database
        await tokenService.storeRefreshToken(refreshToken, user._id);

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
        });

        const userDto = new UserDto(user);
        res.json({auth: true, user: userDto});
    }

    async refresh(req, res) {
        // get refrersh token
        const {refreshToken: refreshTokenCookie} = req.cookies;

        // check if token is valid
        let userData;
        try {

            userData = await tokenService.verifyRefreshToken(refreshTokenCookie);
        } catch (e) {
            return res.status(401).json({message: 'Invalid Token'});
        }

        //check if token in db
        try {
            const token = await tokenService.findRefreshToken(userData._id, refreshTokenCookie);
            if (!token) {
                return res.status(401).json({message: 'Invalid Token'});
            }
        } catch (e) {
            return res.status(500).json({message: 'Internal Server Error'});
        }

        //check if valid user
        const user = await userService.findUser({_id: userData._id});
        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }

        //generate token
        const {refreshToken, accessToken} = await tokenService.generateTokens({_id: userData._id});

        //refresh token update
        try {
            await tokenService.updateRefreshToken(userData._id, refreshToken);
        } catch (e) {
            return res.status(500).json({message: 'Internal Server Error'});
        }

        //put token in cookie
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
        });

        const userDto = new UserDto(user);
        res.json({auth: true, user: userDto});
    }

    //logout
    async logout(req, res) {
        const {refreshToken} = req.cookies;
        //delete refresh token from db
        await tokenService.removeToken(refreshToken);

        //delete cookies
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        res.json({user: null, auth: false});
    }
}

module.exports = new AuthController();
