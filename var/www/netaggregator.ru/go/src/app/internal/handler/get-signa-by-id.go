package handler

import (
    "net/http"

    "github.com/go-chi/chi/v5"
    "go.mongodb.org/mongo-driver/bson"

    "server/internal/structs"
)

type Event struct {
    Sign  structs.StringifiedSigna
    Ip string
}

func (h *Handler) GetSignaById(w http.ResponseWriter, r *http.Request) {
    sid := structs.DocId(chi.URLParam(r, "id"))
    one := h.db.FindOne("signa", bson.M{"_id": sid})

    var result structs.Signa
    if err := one.Decode(&result); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    output := Event{
        Sign: result.SignToString(),
        Ip: r.RemoteAddr,
    }

    Render(w, "signa", output)
}
