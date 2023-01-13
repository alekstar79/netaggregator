import { firebase, roomsRef, messagesRef, usersRef, filesRef, deleteDbField } from '~/firestore/index_v8'
import { parseTimestamp, isSameDay, download } from '~/utils/chat.mjs'

import 'vue-advanced-chat/dist/vue-advanced-chat.css'

export default {
    components: {
        ChatWindow: () => process.browser
            ? import(/* webpackChunkName: "advanced-chat" */ 'vue-advanced-chat')
            : import(/* webpackChunkName: "noop" */ '~/components/core/Noop')
    },
    computed: {
        loadedRooms() {
            return this.rooms.slice(0, this.roomsLoadedCount)
        },
        roomsPerPage() {
            return this.currentUser.id === this.admin ? 15 : 1
        },
        singleRoom() {
            return this.currentUser.id !== this.admin
        },
        mobile() {
            return !!(this.$BROWSER || {}).IS_MOBILE
        }
    },
    data: () => ({
        updatingData: false,
        rooms: [],
        roomId: '',
        startRooms: null,
        endRooms: null,
        roomsLoaded: false,
        loadingRooms: true,
        allUsers: [],
        loadingLastMessageByRoom: 0,
        roomsLoadedCount: false,
        selectedRoom: null,
        messagesPerPage: 20,
        messages: [],
        messagesLoaded: false,
        roomMessage: '',
        startMessages: null,
        endMessages: null,
        roomsListeners: [],
        listeners: [],
        typingMessageCache: '',
        disableForm: false,
        addNewRoom: null,
        addRoomUsername: '',
        inviteRoomId: null,
        invitedUsername: '',
        removeRoomId: null,
        removeUserId: '',
        removeUsers: []
    }),
    methods: {
        resetRooms()
        {
            this.loadingRooms = true
            this.loadingLastMessageByRoom = 0
            this.roomsLoadedCount = 0
            this.rooms = []
            this.roomsLoaded = true
            this.startRooms = null
            this.endRooms = null
            this.roomsListeners.forEach(listener => listener())
            this.roomsListeners = []
            this.resetMessages()
        },
        resetMessages()
        {
            this.messages = []
            this.messagesLoaded = false
            this.startMessages = null
            this.endMessages = null
            this.listeners.forEach(listener => listener())
            this.listeners = []
        },
        fetchRooms()
        {
            this.resetRooms()

            return this.fetchMoreRooms()
        },
        async fetchMoreRooms()
        {
            if (this.endRooms && !this.startRooms) return (this.roomsLoaded = true)

            let query = roomsRef
                .where('users', 'array-contains', this.currentUser.id)
                .orderBy('lastUpdated', 'desc')
                .limit(this.roomsPerPage)

            if (this.startRooms) query = query.startAfter(this.startRooms)

            const roomList = await this.getRoomsList(query),
                formattedRooms = []

            Object.keys(roomList).forEach(key => {
                const room = roomList[key]

                const roomContacts = room.users.filter(user => user._id !== this.currentUser.id)
                const roomAvatar = roomContacts.length === 1 && roomContacts[0].avatar ? roomContacts[0].avatar : '/img/avatars/m01r_130.png'

                room.roomName = roomContacts.map(user => user.username).join(', ') || this.currentUser.roomName

                formattedRooms.push({
                    ...room,
                    roomId: key,
                    avatar: roomAvatar,
                    index: room.lastUpdated.seconds,
                    lastMessage: {
                        content: 'Room created',
                        timestamp: this.formatTimestamp(
                            new Date(room.lastUpdated.seconds),
                            room.lastUpdated
                        )
                    }
                })
            })

            this.rooms = this.rooms.concat(formattedRooms)
            formattedRooms.map(room => this.listenLastMessage(room))

            if (!this.rooms.length) {
                this.loadingRooms = false
                this.roomsLoadedCount = 0
                return
            }

            this.listenUsersOnlineStatus(formattedRooms)
            this.listenRooms(query)
        },
        async getRoomsList(query)
        {
            let rooms, roomUserIds = [], rawUsers = [], roomList = {}

            try {

                rooms = await query.get()

                this.roomsLoaded = rooms.empty || rooms.size < this.roomsPerPage

                if (this.startRooms) this.endRooms = this.startRooms

                this.startRooms = rooms.docs[rooms.docs.length - 1] || null

                rooms.forEach(room => {
                    room.data().users.forEach(userId => {
                        const foundUser = this.allUsers.find(user => user?._id === userId)

                        if (!foundUser && !roomUserIds.includes(userId)) {
                            roomUserIds.push(userId)
                        }
                    })
                })

                roomUserIds.forEach(userId => {
                    const promise = usersRef.doc(`${userId}`).get().then(user => user.data())

                    rawUsers.push(promise)
                })

                this.allUsers = [...this.allUsers, ...(await Promise.all(rawUsers))]

                rooms.forEach(room => {
                    roomList[room.id] = { ...room.data(), users: [] }

                    room.data().users.forEach(userId => {
                        const foundUser = this.allUsers.find(user => user?._id === userId)

                        if (foundUser) {
                            roomList[room.id].users.push(foundUser)
                        }
                    })
                })

            } catch (e) {
            }

            return roomList
        },
        listenLastMessage(room)
        {
            const listener = messagesRef(room.roomId)
                .orderBy('timestamp', 'desc')
                .limit(1)
                .onSnapshot(messages => {
                    messages.forEach(message => {
                        const lastMessage = this.formatLastMessage(message.data())
                        const roomIndex = this.rooms.findIndex(r => room.roomId === r.roomId)

                        this.rooms[roomIndex].lastMessage = lastMessage
                        this.rooms = [...this.rooms]
                    })

                    if (this.loadingLastMessageByRoom < this.rooms.length) {
                        this.loadingLastMessageByRoom++

                        if (this.loadingLastMessageByRoom === this.rooms.length) {
                            this.loadingRooms = false
                            this.roomsLoadedCount = this.rooms.length
                        }
                    }
                })

            this.roomsListeners.push(listener)
        },
        formatLastMessage(message)
        {
            if (!message.timestamp) return

            let content = message.content

            if (message.files?.length) {
                const file = message.files[0]
                content = `${file.name}.${file.extension || file.type}`
            }

            return {
                ...message,
                ...{
                    content,
                    timestamp: this.formatTimestamp(
                        new Date(message.timestamp.seconds * 1000),
                        message.timestamp
                    ),
                    distributed: true,
                    seen: message.sender_id === this.currentUser.id ? message.seen : null,
                    new: message.sender_id !== this.currentUser.id &&
                        (!message.seen || !message.seen[this.currentUser.id])
                }
            }
        },
        formatTimestamp(date, timestamp)
        {
            const timestampFormat = isSameDay(date, new Date()) ? 'HH:mm' : 'DD/MM/YY'
            const result = parseTimestamp(timestamp, timestampFormat)

            return timestampFormat === 'HH:mm'
                ? `Today, ${result}`
                : result
        },
        fetchMessages({ room, options = {} })
        {
            if (options.reset) {
                this.resetMessages()
                this.roomId = room.roomId
            }

            if (this.endMessages && !this.startMessages) {
                return (this.messagesLoaded = true)
            }

            let ref = messagesRef(room.roomId)
            let query = ref.orderBy('timestamp', 'desc').limit(this.messagesPerPage)

            if (this.startMessages) query = query.startAfter(this.startMessages)

            this.selectedRoom = room.roomId

            query.get().then(messages => {
                if (this.selectedRoom !== room.roomId) return

                if (messages.empty || messages.docs.length < this.messagesPerPage) {
                    setTimeout(() => (this.messagesLoaded = true))
                }

                if (this.startMessages) this.endMessages = this.startMessages
                this.startMessages = messages.docs[messages.docs.length - 1]

                let listenerQuery = ref.orderBy('timestamp')

                if (this.startMessages) {
                    listenerQuery = listenerQuery.startAt(this.startMessages)
                }
                if (this.endMessages) {
                    listenerQuery = listenerQuery.endAt(this.endMessages)
                }

                if (options.reset) this.messages = []

                messages.forEach(message => {
                    const formattedMessage = this.formatMessage(room, message)
                    this.messages.unshift(formattedMessage)
                })

                const listener = listenerQuery.onSnapshot(snapshots => {
                    this.listenMessages(snapshots, room)
                })

                this.listeners.push(listener)
            })
        },
        listenMessages(messages, room)
        {
            messages.forEach(message => {
                const formattedMessage = this.formatMessage(room, message)
                const messageIndex = this.messages.findIndex(m => m._id === message.id)

                if (messageIndex === -1) {
                    this.messages = this.messages.concat([formattedMessage])
                } else {
                    this.messages[messageIndex] = formattedMessage
                    this.messages = [...this.messages]
                }

                this.markMessagesSeen(room, message)
            })
        },
        markMessagesSeen(room, message)
        {
            if (message.data().sender_id !== this.currentUser.id &&
                (!message.data().seen || !message.data().seen[this.currentUser.id])
            ) {
                messagesRef(room.roomId)
                    .doc(message.id)
                    .update({
                        [`seen.${this.currentUser.id}`]: new Date()
                    })
            }
        },
        formatMessage(room, message)
        {
            const senderUser = room.users.find(u => message.data().sender_id === u._id)

            const { timestamp } = message.data()

            const formattedMessage = {
                ...message.data(),
                ...{
                    senderId: message.data().sender_id,
                    _id: message.id,
                    seconds: timestamp.seconds,
                    timestamp: parseTimestamp(timestamp, 'HH:mm'),
                    date: parseTimestamp(timestamp, 'DD MMMM YYYY'),
                    username: senderUser ? senderUser.username : null,
                    avatar: senderUser ? senderUser.avatar : null,
                    distributed: true
                }
            }

            if (message.data().replyMessage) {
                formattedMessage.replyMessage = {
                    ...message.data().replyMessage,
                    ...{
                        senderId: message.data().replyMessage.sender_id
                    }
                }
            }

            return formattedMessage
        },
        async sendMessage({ content, roomId, files, replyMessage })
        {
            const message = {
                sender_id: this.currentUser.id,
                content,
                timestamp: new Date()
            }

            if (files) {
                message.files = this.formattedFiles(files)
            }

            if (replyMessage) {
                message.replyMessage = {
                    _id: replyMessage._id,
                    content: replyMessage.content,
                    sender_id: replyMessage.senderId
                }

                if (replyMessage.files) {
                    message.replyMessage.files = replyMessage.files
                }
            }

            try {

                const { id } = await messagesRef(roomId).add(message)

                if (files) {
                    for (let index = 0; index < files.length; index++) {
                        await this.uploadFile({ file: files[index], messageId: id, roomId })
                    }
                }

                roomsRef.doc(roomId).update({ lastUpdated: new Date() })

            } catch (e) {
            }
        },
        async editMessage({ messageId, newContent, roomId, files })
        {
            const newMessage = { edited: new Date() }

            newMessage.content = newContent

            if (files) {
                newMessage.files = this.formattedFiles(files)
            } else {
                newMessage.files = deleteDbField
            }

            try {

                await messagesRef(roomId).doc(messageId).update(newMessage)

            } catch (e) {
            }

            if (!files) return

            for (let index = 0; index < files.length; index++) {
                if (files[index]?.blob) {
                    await this.uploadFile({ file: files[index], messageId, roomId })
                }
            }
        },
        async deleteMessage({ message, roomId })
        {
            try {

                await messagesRef(roomId).doc(message._id).update({ deleted: new Date() })

            } catch (e) {
            }

            if (!message.files) return

            message.files.forEach(file => {
                const deleteFileRef = filesRef
                    .child(`${this.currentUser.id}`)
                    .child(message._id)
                    .child(`${file.name}.${file.extension || file.type}`)

                deleteFileRef.delete()
            })
        },
        uploadFile({ file, messageId, roomId })
        {
            let type = file.extension || file.type

            if (type === 'svg' || type === 'pdf') {
                type = file.type
            }

            const uploadFileRef = filesRef
                .child(`${this.currentUser.id}`)
                .child(messageId)
                .child(`${file.name}.${type}`)

            const uploadTask = uploadFileRef.put(file.blob, {
                contentType: type
            })

            uploadTask.on(
                'state_changed',
                snap => {
                    const progress = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
                    this.updateFileProgress(messageId, file.localUrl, progress)
                },
                _error => {},
                async () => { try {
                    const url = await uploadTask.snapshot.ref.getDownloadURL()

                    const messageDoc = await messagesRef(roomId)
                        .doc(messageId)
                        .get()

                    const files = messageDoc.data().files

                    files.forEach(f => {
                        if (f.url === file.localUrl) {
                            f.url = url
                        }
                    })

                    await messagesRef(roomId)
                        .doc(messageId)
                        .update({ files })

                } catch (e) {
                } }
            )
        },
        updateFileProgress(messageId, fileUrl, progress)
        {
            const message = this.messages.find(message => message._id === messageId)

            if (!message || !message.files) return

            message.files.find(file => file.url === fileUrl).progress = progress

            this.messages = [...this.messages]
        },
        formattedFiles(files)
        {
            const formattedFiles = []

            files.forEach(file => {
                const messageFile = {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    extension: file.extension || file.type,
                    url: file.url || file.localUrl
                }

                if (file.audio) {
                    messageFile.audio = true
                    messageFile.duration = file.duration
                }

                formattedFiles.push(messageFile)
            })

            return formattedFiles
        },
        openFile({ file })
        {
            let fileName = ''

            if (file.file.name !== '') {
                fileName = file.file.name
            }
            if (file.file.extension !== '') {
                fileName += (fileName !== '' ? `.${file.file.extension}` : file.file.extension)
            }

            download(file.file.url, fileName)
        },
        async openUserTag({ user })
        {
            let roomId

            this.rooms.forEach(room => {
                if (room.users.length === 2) {
                    const userId1 = room.users[0]._id
                    const userId2 = room.users[1]._id

                    if ((userId1 === user._id || userId1 === this.currentUser.id) &&
                        (userId2 === user._id || userId2 === this.currentUser.id)
                    ) {
                        roomId = room.roomId
                    }
                }
            })

            if (roomId) return (this.roomId = roomId)

            try {

                const query1 = await roomsRef
                    .where('users', '==', [this.currentUser.id, user._id])
                    .get()

                if (!query1.empty) {
                    return this.loadRoom(query1)
                }

                let query2 = await roomsRef
                    .where('users', '==', [user._id, this.currentUser.id])
                    .get()

                if (!query2.empty) {
                    return this.loadRoom(query2)
                }

                const room = await roomsRef.add({
                    users: [user._id, this.currentUser.id],
                    lastUpdated: new Date()
                })

                this.roomId = room.id
                this.fetchRooms()

            } catch (e) {
            }
        },
        async loadRoom(query)
        {
            for (const room of query) { try {
                if (this.loadingRooms) continue

                await roomsRef.doc(room.id).update({ lastUpdated: new Date() })

                this.roomId = room.id
                this.fetchRooms()

            } catch (e) {
            } }
        },
        menuActionHandler({ action, roomId })
        {
            switch (action.name) {
                case 'inviteUser':
                    return this.inviteUser(roomId)
                case 'removeUser':
                    return this.removeUser(roomId)
                case 'deleteRoom':
                    return this.deleteRoom(roomId)
            }
        },
        async sendMessageReaction({ reaction, remove, messageId, roomId })
        {
            const dbAction = remove
                ? firebase.firestore.FieldValue.arrayRemove(this.currentUser.id)
                : firebase.firestore.FieldValue.arrayUnion(this.currentUser.id)

            await messagesRef(roomId).doc(messageId)
                .update({ [`reactions.${reaction.unicode}`]: dbAction })
        },
        typingMessage({ message, roomId })
        {
            if (!roomId) return

            if (message?.length > 1) {
                return (this.typingMessageCache = message)
            }

            if (message?.length === 1 && this.typingMessageCache) {
                return (this.typingMessageCache = message)
            }

            this.typingMessageCache = message

            const dbAction = message
                ? firebase.firestore.FieldValue.arrayUnion(this.currentUser.id)
                : firebase.firestore.FieldValue.arrayRemove(this.currentUser.id)

            roomsRef.doc(roomId).update({
                typingUsers: dbAction
            })
        },
        listenRooms(query)
        {
            const listener = query.onSnapshot(rooms => {
                rooms.forEach(room => {
                    const foundRoom = this.rooms.find(r => r.roomId === room.id)

                    if (foundRoom) {
                        foundRoom.typingUsers = room.data().typingUsers
                        foundRoom.index = room.data().lastUpdated.seconds
                    }
                })
            })

            this.roomsListeners.push(listener)
        },
        updateUserOnlineStatus()
        {
            const userStatusRef = firebase.database().ref(`/status/${this.currentUser.id}`)

            const isOfflineData = {
                state: 'offline',
                lastChanged: firebase.database.ServerValue.TIMESTAMP
            }

            const isOnlineData = {
                state: 'online',
                lastChanged: firebase.database.ServerValue.TIMESTAMP
            }

            firebase.database()
                .ref('.info/connected')
                .on('value', snapshot => {
                    if (snapshot.val() === false) return

                    userStatusRef
                        .onDisconnect()
                        .set(isOfflineData)
                        .then(() => {
                            userStatusRef.set(isOnlineData)
                        })
                })
        },
        listenUsersOnlineStatus(rooms)
        {
            rooms.forEach(room => {
                room.users.forEach(user => {
                    const listener = firebase
                        .database()
                        .ref(`/status/${user._id}`)
                        .on('value', snapshot => {
                            if (!snapshot || !snapshot.val()) return

                            const lastChanged = this.formatTimestamp(
                                new Date(snapshot.val().lastChanged),
                                new Date(snapshot.val().lastChanged)
                            )

                            user.status = { ...snapshot.val(), lastChanged }

                            const roomIndex = this.rooms.findIndex(r => room.roomId === r.roomId)

                            this.rooms[roomIndex] = room
                            this.rooms = [...this.rooms]
                        })

                    this.roomsListeners.push(listener)
                })
            })
        },
        async setRoom()
        {
            this.disableForm = true

            const { id, username, avatar } = this.currentUser

            try {

                await usersRef.doc(`${id}`).set({ _id: id, username, avatar })

                await roomsRef.add({
                    users: [this.admin, this.currentUser.id],
                    lastUpdated: new Date()
                })

            } catch (e) {
            }

            this.addNewRoom = false
            this.addRoomUsername = ''
            this.fetchRooms()
        },
        async init()
        {
            if (!this.currentUser.id) {
                this.resetRooms()
                return
            }

            const { id } = this.currentUser

            await this.fetchRooms()

            if (id === this.admin) return

            if (!this.rooms.length) {
                await this.setRoom()
            }

            this.updateUserOnlineStatus()
            this.reload()
        },

        // not used
        addRoom()
        {
            this.resetForms()
            this.addNewRoom = true
        },
        async createRoom()
        {
            this.disableForm = true

            try {

                const { id } = await usersRef.add({ username: this.addRoomUsername })
                await usersRef.doc(id).update({ _id: id })

                await roomsRef.add({
                    users: [id, this.currentUser.id],
                    lastUpdated: new Date()
                })

            } catch (e) {
            }

            this.addNewRoom = false
            this.addRoomUsername = ''
            this.fetchRooms()
        },
        inviteUser(roomId)
        {
            this.resetForms()
            this.inviteRoomId = roomId
        },
        async addRoomUser()
        {
            this.disableForm = true

            try {

                const { id } = await usersRef.add({ username: this.invitedUsername })

                await usersRef.doc(id).update({ _id: id })
                await roomsRef.doc(this.inviteRoomId).update({ users: firebase.firestore.FieldValue.arrayUnion(id) })

            } catch (e) {
            }

            this.inviteRoomId = null
            this.invitedUsername = ''
            this.fetchRooms()
        },
        removeUser(roomId)
        {
            this.resetForms()
            this.removeRoomId = roomId
            this.removeUsers = this.rooms.find(room => room.roomId === roomId).users
        },
        async deleteRoomUser()
        {
            this.disableForm = true

            try {

                await roomsRef.doc(this.removeRoomId).update({
                    users: firebase.firestore.FieldValue.arrayRemove(this.removeUserId)
                })

            } catch (e) {
            }

            this.removeRoomId = null
            this.removeUserId = ''
            this.fetchRooms()
        },
        async deleteRoom(roomId)
        {
            const ref = messagesRef(roomId)

            try {

                ref.get().then(res => {
                    if (res.empty) return
                    res.docs.map(doc => ref.doc(doc.id).delete())
                })

                await roomsRef.doc(roomId).delete()

            } catch (e) {
            }

            this.fetchRooms()
        },
        resetForms()
        {
            this.disableForm = false
            this.addNewRoom = null
            this.addRoomUsername = ''
            this.inviteRoomId = null
            this.invitedUsername = ''
            this.removeRoomId = null
            this.removeUserId = ''
        }
    }
}
