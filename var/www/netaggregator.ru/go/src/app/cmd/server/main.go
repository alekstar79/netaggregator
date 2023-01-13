package main

import (
    "context"
    "fmt"
    "log"
    "net/http"
    "os"
    "os/signal"
    "server/internal/handler"
    "server/internal/session"
    "syscall"
    "time"

    "github.com/ilyakaznacheev/cleanenv"

    "server/internal/api/jokes"
    "server/internal/app"
    "server/internal/config"
    "server/internal/db"
    "server/internal/utils"
)

func main() {
    ctx := context.Background()
    env := utils.Root(".env")
    cfg := config.Server{}

    err := cleanenv.ReadConfig(env, &cfg)
    if err != nil {
        log.Fatal(err)
    }

    dbClient := db.NewDbClient(cfg.MongoUrl, ctx)
    apiClient := jokes.NewApiClient(cfg.JokeURL)
    ses := session.NewSession()

    h := handler.NewHandler(dbClient, apiClient, ses)
    w := handler.Watcher()

    srv := &http.Server{
        WriteTimeout: 10 * time.Second,
        ReadTimeout:  10 * time.Second,
        IdleTimeout:  30 * time.Second,
        Addr: fmt.Sprintf("%s:%s", cfg.Host, cfg.Port),
        Handler: app.InitRoutes(h),
    }

    // handle shutdown gracefully
    quit := make(chan os.Signal, 1)
    done := make(chan error, 1)
    signal.Notify(quit, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

    go func() {
        <-quit
        ctx, cancel := context.WithTimeout(ctx, time.Minute)
        defer cancel()

        err := srv.Shutdown(ctx)
        dbClient.Disconnect()
        _ = w.Close()
        done <- err
    }()

    log.Printf("server start %s:%s", cfg.Host, cfg.Port)
     _ = srv.ListenAndServe()

    err = <-done
    log.Printf("server shutdown with %v", err)
}
