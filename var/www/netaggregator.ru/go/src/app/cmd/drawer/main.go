// https://github.com/romanitalian/img-generator

package main

import (
    "fmt"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/ilyakaznacheev/cleanenv"

    "server/internal/config"
    "server/internal/handler"
    "server/internal/middleware"
    "server/internal/utils"
)

func main() {
    env := utils.Root(".env")
    cfg := config.Server{}

    err := cleanenv.ReadConfig(env, &cfg)
    if err != nil {
        log.Fatal(err)
    }

    http.HandleFunc("/favicon.ico", handler.FaviconHandler)
    http.HandleFunc("/ping", handler.PingHandler)
    http.HandleFunc("/img/", handler.ImgHandler)
    http.HandleFunc("/", handler.MainHandler)

    srv := &http.Server{
        Handler: middlewares.TrimSlash(http.DefaultServeMux),
        Addr: fmt.Sprintf("%s:%s", cfg.Host, cfg.Port),

        WriteTimeout: 10 * time.Second,
        ReadTimeout:  10 * time.Second,
        IdleTimeout:  30 * time.Second,
    }

    sigs := make(chan os.Signal, 1)
    signal.Notify(sigs, os.Interrupt, syscall.SIGINT, syscall.SIGTERM)

    go func() {
        log.Printf("server start %s", srv.Addr)
        if err = srv.ListenAndServe(); err != nil {
            log.Fatal(err)
        }
    }()

    <-sigs
    signal.Stop(sigs)
    log.Println("server stop")
}
