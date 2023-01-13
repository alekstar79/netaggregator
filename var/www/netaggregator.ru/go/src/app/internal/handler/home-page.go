package handler

import (
    "net/http"

    "server/internal/api"
)

func (h *Handler) HomePage(w http.ResponseWriter, _ *http.Request) {
    var joke *api.JokeResponse

    if joke, err = h.api.GetJoke(); err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    Render(w, "index", joke)
}
