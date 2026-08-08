import { getCurrentUserProfile } from "../firebase/userService.js";

const ENTERPRISE_ROLES = [
    "employee",
    "manager",
    "admin"
];

export async function checkEnterpriseAccess() {

    const profile = await getCurrentUserProfile();

    if (!profile) {

        return {
            allowed: false,
            reason: "unauthenticated"
        };

    }

    if (profile.active !== true) {

        return {
            allowed: false,
            reason: "inactive"
        };

    }

    if (!ENTERPRISE_ROLES.includes(profile.role)) {

        return {
            allowed: false,
            reason: "unauthorized"
        };

    }

    return {
        allowed: true,
        profile
    };

}