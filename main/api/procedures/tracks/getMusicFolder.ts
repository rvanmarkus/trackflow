import { dialog } from "electron";
import path from "path";
import { publicProcedure } from "../../trpc";

export const getMusicFolder = publicProcedure.query(async () => {
    try {
        const { filePaths } = await dialog.showOpenDialog({ properties: ['openDirectory'] });

        return filePaths.length ? filePaths[0] : path.join(__dirname, '../music');
    } catch (e) {
        console.log(`error opening dialog ${e}`);

    }
});