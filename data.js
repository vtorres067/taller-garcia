// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDpRd-1CjvGI_A2AnuyyUdKpuGprkKwNTU",
    authDomain: "taller-1c6c3.firebaseapp.com",
    projectId: "taller-1c6c3",
    storageBucket: "taller-1c6c3.firebasestorage.app",
    messagingSenderId: "817244652498",
    appId: "1:817244652498:web:03825f04e343a495eefe0b",
    measurementId: "G-9KR0VNZS06"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

class DataStore {
    async init() {
    }

    async loginWithGoogle() {
        try {
            const result = await auth.signInWithPopup(provider);
            const userEmail = result.user.email.toLowerCase();
            const userName = result.user.displayName;

            const allUsers = await db.collection('users').limit(1).get();
            const snapshot = await db.collection('users').where('email', '==', userEmail).get();
            
            if (snapshot.empty && allUsers.empty) {
                const newUser = { email: userEmail, name: userName, role: 'admin' };
                await db.collection('users').add(newUser);
                return newUser;
            } else if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return { id: doc.id, email: userEmail, name: userName, ...doc.data() };
            } else {
                await auth.signOut();
                return { error: 'No tienes permisos para acceder al sistema.' };
            }
        } catch (error) {
            console.error(error);
            if (error.code === 'auth/unauthorized-domain') {
                return { error: 'Operación bloqueada. Para usar Google, la app debe estar en un servidor web.' };
            }
            return { error: 'Error al iniciar sesión con Google.' };
        }
    }

    async loginWithEmail(email, password) {
        try {
            let result;
            try {
                result = await auth.signInWithEmailAndPassword(email, password);
            } catch (err) {
                if (err.code === 'auth/user-not-found') {
                    // Check if DB is completely empty. If so, make this user the admin automatically.
                    const allUsers = await db.collection('users').limit(1).get();
                    if (allUsers.empty) {
                        result = await auth.createUserWithEmailAndPassword(email, password);
                        await db.collection('users').add({ email: email.toLowerCase(), name: 'Administrador', role: 'admin' });
                    } else {
                        return { error: 'Correo no registrado o no tienes permisos.' };
                    }
                } else if (err.code === 'auth/wrong-password') {
                    return { error: 'Contraseña incorrecta.' };
                } else if (err.code === 'auth/invalid-email') {
                    return { error: 'El formato del correo es inválido.' };
                } else {
                    return { error: err.message };
                }
            }

            // Confirm user exists in our Firestore DB
            const userEmail = result.user.email.toLowerCase();
            const snapshot = await db.collection('users').where('email', '==', userEmail).get();
            
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                return { id: doc.id, email: userEmail, ...doc.data() };
            } else {
                await auth.signOut();
                return { error: 'No tienes permisos para acceder al sistema.' };
            }
        } catch (error) {
            console.error(error);
            return { error: 'Error al iniciar sesión.' };
        }
    }

    async logout() {
        await auth.signOut();
    }

    async updatePassword(newPassword) {
        try {
            const user = auth.currentUser;
            if (user) {
                await user.updatePassword(newPassword);
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async addUser(userObj, tempPassword) {
        // userObj has: { name, email, role }
        const snapshot = await db.collection('users')
            .where('email', '==', userObj.email.toLowerCase())
            .get();
            
        if (!snapshot.empty) {
            return false; // email already registered
        }

        try {
            // Use a secondary app to create the user so the current admin doesn't get logged out
            const secondaryApp = firebase.initializeApp(firebaseConfig, "Secondary");
            await secondaryApp.auth().createUserWithEmailAndPassword(userObj.email, tempPassword);
            await secondaryApp.auth().signOut();
            await secondaryApp.delete();
            
            await db.collection('users').add({ ...userObj, email: userObj.email.toLowerCase() });
            return true;
        } catch(e) {
            console.error("Error creando usuario", e);
            return false;
        }
    }

    async getJobs() {
        const snapshot = await db.collection('jobs').get();
        const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return jobs.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    }

    async addJob(job) {
        const newJob = {
            ...job,
            status: 'pending',
            dateAdded: new Date().toISOString()
        };
        const docRef = await db.collection('jobs').add(newJob);
        return { id: docRef.id, ...newJob };
    }

    async updateJobStatus(id, newStatus) {
        await db.collection('jobs').doc(id).update({ status: newStatus });
        const doc = await db.collection('jobs').doc(id).get();
        return { id: doc.id, ...doc.data() };
    }

    async deleteJob(id) {
        await db.collection('jobs').doc(id).delete();
    }

    async findJobsByPlate(plate) {
        const searchPlate = plate.toLowerCase().replace(/\s/g, '');
        const snapshot = await db.collection('jobs').get();
        const jobs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return jobs.filter(j => j.plate.toLowerCase().replace(/\s/g, '') === searchPlate)
                   .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
    }
}

const store = new DataStore();
