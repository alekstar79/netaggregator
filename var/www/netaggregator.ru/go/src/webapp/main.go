package main

import (
    "fmt"
    "log"
    "net/http"
    "os"
    "time"

    "github.com/joho/godotenv"

    "webapp/db"
)

func main() {
    err := godotenv.Load()

    if err != nil {
        log.Fatal(err)
    }

    HOST := os.Getenv("HOST")
    PORT := os.Getenv("PORT")

    srv := &http.Server{
        WriteTimeout: 15 * time.Second,
        ReadTimeout:  15 * time.Second,
        IdleTimeout:  60 * time.Second,
        Addr:         fmt.Sprintf("%s:%s", HOST, PORT),
        Handler:      initializeApp(),
    }

    defer db.Disconnect()

    log.Fatal(srv.ListenAndServe())
}
