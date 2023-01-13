package handler

import (
    "bytes"
    "log"
    "net/http"
    "strconv"
    "strings"

    "server/internal/pkg/img"
)

func rend(w http.ResponseWriter, msg string) {
    _, err := w.Write([]byte(msg))
    if err != nil {
        log.Println(err)
    }
}

func rendImg(w http.ResponseWriter, buffer *bytes.Buffer) {
    w.Header().Set("Content-Type", "image/jpeg")
    w.Header().Set("Content-Length", strconv.Itoa(len(buffer.Bytes())))

    if _, err := w.Write(buffer.Bytes()); err != nil {
        log.Println(err)
    }
}

func FaviconHandler(w http.ResponseWriter, _ *http.Request) {
    buffer, err := img.GenerateFavicon()
    if err != nil {
        log.Println(err)
    }

    rendImg(w, buffer)
}

func ImgHandler(w http.ResponseWriter, r *http.Request) {
    path := strings.TrimPrefix(r.URL.Path, "/img")
    buffer, err := img.Generate(strings.Split(path, "/"))
    if err != nil {
        log.Println(err)
    }

    rendImg(w, buffer)
}

func MainHandler(w http.ResponseWriter, _ *http.Request) {
    rend(w, "OK")
}
func PingHandler(w http.ResponseWriter, _ *http.Request) {
    rend(w, "PONG")
}
