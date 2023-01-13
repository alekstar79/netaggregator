package middlewares

import (
	"net/http"
	"regexp"
)

func TrimSlash(next http.Handler) http.Handler {
	re := regexp.MustCompile("(\\w+)/$")

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if re.MatchString(r.RequestURI) {
			path := re.ReplaceAllString(r.RequestURI, "$1")
			http.Redirect(w, r, path, http.StatusMovedPermanently)
			return
		}

		next.ServeHTTP(w, r)
	})
}
