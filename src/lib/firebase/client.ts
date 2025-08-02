
import { 
    onAuthStateChanged as _onAuthStateChanged,
    User
} from "firebase/auth";
import { auth } from './config';

// This function is intended for client-side use.
export function onAuthStateChanged(callback: (user: User | null) => void) {
    return _onAuthStateChanged(auth, callback);
}
