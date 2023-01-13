import { initializeApp } from 'firebase/app'

import { getFirestore, serverTimestamp, collection, doc, deleteField } from 'firebase/firestore'
// import { getDatabase, res as dRef } from 'firebase/database'
import { getStorage, ref as sRef } from 'firebase/storage'

const app = initializeApp({
    apiKey: 'AIzaSyD4MTRRG8ADLjobODDfL1H47EF7F2qBISg',
    authDomain: 'netaggregator.firebaseapp.com',
    databaseURL: 'https://netaggregator-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'netaggregator',
    storageBucket: 'netaggregator.appspot.com',
    messagingSenderId: '342218517272',
    appId: '1:342218517272:web:8f75bf334a784d0dd48c6d'
})

export const firebase = app
export const db = getFirestore(app)

export const roomsRef = collection(db, 'chatRooms')
export const usersRef = collection(db, 'users')

export const messagesRef = roomId => collection(doc(roomsRef, roomId), 'messages')

// export const storageRef = app.storage().ref()
export const storageRef = sRef(getStorage(app))
export const filesRef = sRef(storageRef, 'files')

export const dbTimestamp = serverTimestamp()
export const deleteDbField = deleteField()
