package handler

import "net/http"

func (h *Handler) GetSignaPage(w http.ResponseWriter, _ *http.Request) {
    Render(w, "add-sign", nil)
}
