import { dialog } from "electron";
import { publicProcedure } from "../../trpc";

export const getOutputFolder = publicProcedure.query(async () => {
    const { filePaths } = await dialog.showOpenDialog({
        properties: ["openDirectory"],
    });
    return filePaths?.[0];
})