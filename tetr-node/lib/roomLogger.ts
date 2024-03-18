const rooms = new Set<string>();

const addRoom = (roomId: string) => rooms.add(roomId);

// @ts-ignore
const getRooms = () => Array.from(rooms.values());

const removeRoom = (roomId: string) => rooms.delete(roomId);

export { rooms, addRoom, getRooms, removeRoom };
