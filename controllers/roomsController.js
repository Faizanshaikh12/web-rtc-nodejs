const roomsService = require('../services/roomsService')
const RoomDto = require('../dtos/roomDto')

class RoomsController {
    async create(req, res) {
        // rooms creation
        const {topic, roomType} = req.body;

        // validation
        if (!topic || !roomType) {
            return res.status(404).json({message: 'All fields are required!'});
        }

        //rooms
        const room = await roomsService.create({
            topic,
            roomType,
            ownerId: req.user._id,
        });

        return res.json(new RoomDto(room));
    }

    async index(req, res) {
        const rooms = await roomsService.getAllRooms(['open']);
        const allRooms = rooms.map((room) => new RoomDto(room));
        return res.json(allRooms);
    }

    async show(req, res){
        const room = await roomsService.getRoom(req.params.roomId);
        return res.json(room);
    }
}

module.exports = new RoomsController();
