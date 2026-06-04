import { auth } from "@clerk/nextjs/server";

const adminIds = [
    "user_3CRCTAofbyLEOVQuAglIMBca4D2"
];

export const IsAdmin = async () => {
    const { userId, sessionClaims } = await auth()


    if (!userId) {
        return false;
    }

    return adminIds.indexOf(userId) !== -1;
}
