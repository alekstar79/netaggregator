package main

import (
    "github.com/gorilla/mux"
    "net/http"
    "webapp/controllers"
    "webapp/db"
    "webapp/middlewares"
)

func initializeApp() http.Handler {
    conn := db.GetConnection()
    r := mux.NewRouter()

    dir := "./static"

    r.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(http.Dir(dir))))

    r.HandleFunc("/", controllers.HomePage).Methods("GET")
    r.Handle("/contact", controllers.ContactsPage(conn)).Methods("GET")
    r.HandleFunc("/about", controllers.AboutPage).Methods("GET")

    r.HandleFunc("/signa/{id:[\\w\\d]+}", controllers.SignaPage).Methods("GET")
    r.HandleFunc("/signa", controllers.AddSignaPost).Methods("POST")
    r.HandleFunc("/signa", controllers.AddSignaPage).Methods("GET")

    return middlewares.TrimSlash(r)
}
