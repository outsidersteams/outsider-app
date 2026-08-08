import {
    getFirestore,
    collection,
    getDocs,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { app } from "./config.js";

const db = getFirestore(app);

export async function getCategories() {

    const categoriesRef = collection(db, "categories");

    const snapshot = await getDocs(categoriesRef);

    const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return categories;
}
export async function getUserProfile(uid) {

    const userRef = doc(
        db,
        "users",
        uid
    );

    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {

        return null;

    }

    return {
        id: snapshot.id,
        ...snapshot.data()
    };

}