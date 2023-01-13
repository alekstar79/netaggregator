package db

import (
    "context"
    "go.mongodb.org/mongo-driver/mongo"
    "go.mongodb.org/mongo-driver/mongo/options"
    "log"
)

type Connection struct {
    Client *mongo.Client
    Ctx context.Context
    Db string
}

func NewDbClient(url string, ctx context.Context) *Connection {
    opt := options.Client().ApplyURI(url)

    var (
        client *mongo.Client
        err error
    )

    if client, err = mongo.Connect(ctx, opt); err != nil {
        log.Fatal(err)
    }
    if err = client.Ping(ctx, nil); err != nil {
        log.Fatal(err)
    }

    return &Connection{
        Client: client,
        Db: "app",
        Ctx: ctx,
    }
}

func (c *Connection) GetCollection(collection string) *mongo.Collection {
    return c.Client.Database(c.Db).Collection(collection)
}

func (c *Connection) Disconnect() {
    if err := c.Client.Disconnect(c.Ctx); err != nil {
        log.Fatal(err)
    }
}

func (c *Connection) CloseCursor(cursor *mongo.Cursor) {
    if err := cursor.Close(c.Ctx); err != nil {
        log.Fatal(err)
    }
}

func (c *Connection) Context() context.Context {
    return c.Ctx
}

func (c *Connection) InsertOne(collection string, document interface{}) (*mongo.InsertOneResult, error) {
    return c.GetCollection(collection).InsertOne(c.Ctx, document)
}

func (c *Connection) FindOne(collection string, filter interface{}) *mongo.SingleResult {
    return c.GetCollection(collection).FindOne(c.Ctx, filter)
}

func (c *Connection) Find(collection string, filter interface{}) (*mongo.Cursor, error) {
    return c.GetCollection(collection).Find(c.Ctx, filter)
}
