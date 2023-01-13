package handler

import "net/http"

func (h *Handler) AboutPage(w http.ResponseWriter, _ *http.Request) {
    Render(w, "about", nil)
}
