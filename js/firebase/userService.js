import { getCurrentAuthUser } from "./auth.js";

import { getUserProfile } from "./firestore.js";


export async function getCurrentUserProfile() {

    const user = getCurrentAuthUser();

    if (!user) {

        return null;

    }

    const profile = await getUserProfile(
        user.uid
    );

    return profile;

}