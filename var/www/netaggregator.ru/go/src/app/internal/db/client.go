package db

import (
    "context"
    "go.mongodb.org/mongo-driver/mongo"
)

type Client interface {
    GetCollection(collection string) *mongo.Collection
    CloseCursor(cursor *mongo.Cursor)
    Context() context.Context
    Disconnect()

    InsertOne(collection string, document interface{}) (*mongo.InsertOneResult, error)
    FindOne(collection string, filter interface{}) *mongo.SingleResult
    Find(collection string, filter interface{}) (*mongo.Cursor, error)
}
