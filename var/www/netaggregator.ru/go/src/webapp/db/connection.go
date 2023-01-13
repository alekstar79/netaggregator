package db

import (
    "context"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
    "log"
    "os"
    "webapp/structs"
)

var (
    err  error
    conn = structs.Connection{
        Ctx: context.Background(),
        Db:  "app",
    }
)

func initDB() structs.Connection {
    opt := options.Client().ApplyURI(os.Getenv("MONGO_URL"))

    if conn.Client, err = mongo.Connect(conn.Ctx, opt); err != nil {
        log.Fatal(err)
    }
    if err = conn.Client.Ping(conn.Ctx, nil); err != nil {
        log.Fatal(err)
    }

    return conn
}

func GetConnection() structs.Connection {
    if conn.Client == nil {
        return initDB()
    }

    return conn
}

func Disconnect() {
    if err := conn.Client.Disconnect(conn.Ctx); err != nil {
        log.Fatal(err)
    }
}

func GetCollection(collection string) *mongo.Collection {
    return conn.Client.Database(conn.Db).Collection(collection)
}

func CloseCursor(cursor *mongo.Cursor) {
    if err := cursor.Close(conn.Ctx); err != nil {
        log.Fatal(err)
    }
}
