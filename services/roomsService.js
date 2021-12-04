const Room = require('../models/roomModal')

class RoomsService {

    async create(payload) {
        const {topic, roomType, ownerId} = payload;
        const room = await Room.create({
            topic,
            roomType,
            ownerId,
            speakers: [ownerId]
        });
        return room;
    }

    async getAllRooms(types) {
        const rooms = await Room.find({roomType: {$in: types}})
            .populate('speakers')
            .populate('ownerId')
            .exec();
        return rooms;
    }
}

module.exports = new RoomsService();
