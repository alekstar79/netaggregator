package app

import (
    "net/http"
    "time"

    "github.com/go-chi/chi/middleware"
    "github.com/go-chi/chi/v5"

    "server/internal/handler"
)

func InitRoutes(h *handler.Handler) http.Handler {
    r := chi.NewRouter()

    // A good base middleware stack
    r.Use(middleware.RedirectSlashes)
    r.Use(middleware.RequestID)
    r.Use(middleware.RealIP)
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)

    // Set a timeout value on the request context (ctx), that will signal
    // through ctx.Done() that the request has timed out and further
    // processing should be stopped.
    r.Use(middleware.Timeout(30 * time.Second))

    r.Handle("/static/*", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
    r.Get("/contact", h.ContactPage)
    r.Get("/about", h.AboutPage)

    r.Route("/signa", func(r chi.Router) {
        r.Get("/{id:[\\w\\d]+}", h.GetSignaById) // GET /signa/{id}
        r.Get("/", h.GetSignaPage)               // GET /signa
        r.Post("/", h.CreateSigna)               // POST /signa
    })

    r.Get("/", h.HomePage)

    return r
}
