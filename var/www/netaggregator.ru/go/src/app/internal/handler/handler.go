package handler

import (
	"fmt"
	"html/template"
	"io/fs"
	"log"
	"net/http"
	"path/filepath"
	"regexp"

	"gopkg.in/fsnotify/fsnotify.v1"

	"server/internal/api"
	"server/internal/db"
	"server/internal/session"
	"server/internal/utils"
)

type Handler struct {
	ses session.Session
	api api.Client
	db db.Client
}

var (
	root = utils.Root("internal/templates")
	dirs = []string{"*/*/*", "*/*", "*"}
	views *template.Template
)

func parse(ext string) *template.Template {
	templateBuilder := template.New("")

	for _, v := range dirs {
		v = fmt.Sprintf("%s/%s.%s", root, v, ext)

		if t, _ := templateBuilder.ParseGlob(v); t != nil {
			templateBuilder = t
		}
	}

	return templateBuilder
}

func Render(w http.ResponseWriter, temp string, data interface{}) {
	err := views.ExecuteTemplate(w, temp, data)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func Watcher() *fsnotify.Watcher {
	re := regexp.MustCompile(`\.gohtml$`)

	watcher, err := fsnotify.NewWatcher()
	if err != nil {
		log.Fatalf("Failed to create directory watcher %v", err)
	}

	go func() {
		for {
			select {
			case event := <-watcher.Events:
				if event.Op&fsnotify.Write == fsnotify.Write {
					log.Printf("Re-parsing templates because of modified file %v", event.Name)
					views = parse("gohtml")
				}
			case err := <-watcher.Errors:
				log.Fatalf("Failed in directory watcher %v", err)
			}
		}
	}()

	_ = filepath.Walk(root, func(path string, info fs.FileInfo, err error) error {
		if !re.MatchString(path) {
			err = watcher.Add(path)
			if err != nil {
				log.Fatalf("Failed to add directory to watcher %v", err)
			}
		}

		return nil
	})

	return watcher
}

func NewHandler(db db.Client, api api.Client, ses session.Session) *Handler {
	views = parse("gohtml")

	return &Handler{
		ses,
		api,
		db,
	}
}
