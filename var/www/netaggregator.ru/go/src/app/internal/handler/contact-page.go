package handler

import (
    "net/http"

    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"

    "server/internal/structs"
)

var (
    output []structs.StringifiedSigna
    result []structs.Signa
    cursor *mongo.Cursor
    err error
)

func (h *Handler) ContactPage(w http.ResponseWriter, r *http.Request) {
    output = []structs.StringifiedSigna{}
    result = []structs.Signa{}

    cursor, err = h.db.Find("signa", bson.D{})

    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    if err = cursor.All(r.Context(), &result); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    for _, s := range result {
        output = append(output, s.SignToString())
    }

    Render(w, "contacts", output)
}
