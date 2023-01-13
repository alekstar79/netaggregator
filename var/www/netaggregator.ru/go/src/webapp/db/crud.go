package db

import "go.mongodb.org/mongo-driver/mongo"

func FindOne(collection string, filter interface{}) *mongo.SingleResult {
    return GetCollection(collection).FindOne(conn.Ctx, filter)
}

func InsertOne(collection string, document interface{}) (*mongo.InsertOneResult, error) {
    return GetCollection(collection).InsertOne(conn.Ctx, document)
}

func Find(collection string, filter interface{}) (*mongo.Cursor, error) {
    return GetCollection(collection).Find(conn.Ctx, filter)
}
