import { insert, query, remove } from "./mongodb";

export interface Announcment {
  content: string;
  _id: string;
  color: string;
}
export const loadAnnouncments = async () => {
  return (await query("announcments", {})).map((item) => ({
    ...item,
    _id: item._id.toString(),
  }));
};

export const addAnnouncement = async (color: string, content: string) => {
  await insert("announcments", { color, content });
  return true;
};

export const removeAnnoucment = async (id: string) => {
  if (await remove("announcments", { _id: Object(id) })) return true;
  else throw new Error("Announcment not found");
};
