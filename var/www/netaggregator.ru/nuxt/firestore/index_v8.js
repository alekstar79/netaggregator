import app from 'firebase/app'

import 'firebase/firestore'
import 'firebase/database'
import 'firebase/storage'

app.initializeApp({
    apiKey: 'AIzaSyD4MTRRG8ADLjobODDfL1H47EF7F2qBISg',
    authDomain: 'netaggregator.firebaseapp.com',
    databaseURL: 'https://netaggregator-default-rtdb.europe-west1.firebasedatabase.app',
    projectId: 'netaggregator',
    storageBucket: 'netaggregator.appspot.com',
    messagingSenderId: '342218517272',
    appId: '1:342218517272:web:8f75bf334a784d0dd48c6d'
})

export const firebase = app
export const db = app.firestore()
export const storageRef = app.storage().ref()

export const usersRef = db.collection('users')
export const roomsRef = db.collection('chatRooms')
export const messagesRef = roomId => roomsRef.doc(roomId).collection('messages')

export const filesRef = storageRef.child('files')

export const dbTimestamp = firebase.firestore.FieldValue.serverTimestamp()
export const deleteDbField = firebase.firestore.FieldValue.delete()
