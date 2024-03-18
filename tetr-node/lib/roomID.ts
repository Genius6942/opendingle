export const isValidRoomID = (id: string) => /^[\w\d]{1,16}$/.test(id);
