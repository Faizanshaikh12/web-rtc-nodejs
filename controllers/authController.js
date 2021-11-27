const otpService = require('../services/otpService')
const hashService = require('../services/hashService')
const userService = require('../services/userService')
const tokenService = require('../services/tokenService')

class AuthController {
    async sendOtp(req, res) {
        // Logic
        const {phone} = req.body;
        if (!phone) {
            res.status(400).json({message: 'Phone field is required'});
        }

        const otp = await otpService.generateOtp();

        // Hash
        const ttl = 1000 * 60 * 5; // 2 min
        const expires = Date.now() + ttl;
        const data = `${phone}.${otp}.${expires}`;
        const hash = await hashService.hashOtp(data);
        // Send Otp
        try {
            await otpService.smsOtp(phone, otp);
            return res.json({
                hash: `${hash}.${expires}`,
                phone,
                otp
            })
        } catch (err) {
            console.log(err)
            res.status(500).json({message: 'Message sending failed'})
        }

        res.json({hash: hash});
    }

    async verifyOtp(req, res) {
        // Logic
        const {otp, hash, phone} = req.body;
        if (!otp || !phone || !hash) {
            res.status(400).json({message: 'All fields are required'});
        }
        const [hashedOtp, expires] = hash.split('.');
        if (Date.now() > +expires) {
            res.status(400).json({message: 'OTP expired!'});
        }

        const data = `${phone}.${otp}.${expires}`;
        const isValid = otpService.verifyOtp(hashedOtp, data);
        if (!isValid) {
            res.status(400).json({ message: 'Invalid OTP' });
        }

        let user;
        try {
            user = await userService.findUser({ phone });
            if (!user) {
                user = await userService.createUser({ phone });
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ message: 'Db error' });
        }

        const { accessToken, refreshToken } = tokenService.generateTokens({
            _id: user._id,
            activated: false,
        });

try{
    res.cookie('refreshToken', refreshToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
    });
} catch(err){
    console.log(err);
}
        // JWT Token
        res.json(accessToken);
    }
}

module.exports = new AuthController();
