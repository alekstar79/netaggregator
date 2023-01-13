package handler

import (
    "net/http"
    "server/internal/structs"
)

func (h *Handler) CreateSigna(w http.ResponseWriter, r *http.Request) {
    post := structs.CreateSign(
        r.FormValue("img"),
        r.FormValue("x"),
        r.FormValue("y"),
        r.FormValue("angle"),
        r.FormValue("font"),
        r.FormValue("size"),
        r.FormValue("color"),
    )

    _, err := h.db.InsertOne("signa", post)

    if err != nil {
        http.Redirect(w, r, "/signa", http.StatusBadRequest)
    } else {
        http.Redirect(w, r, "/contact", http.StatusSeeOther)
    }
}
