package controllers

import (
    "fmt"
    "github.com/gorilla/mux"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
    "html/template"
    "net/http"
    "webapp/db"
    "webapp/structs"
)

const (
    header = "templates/parts/header.gohtml"
    footer = "templates/parts/footer.gohtml"
)

var bob = structs.User{Name: "Bob", Age: 21, Money: -50, Avg: 79, Happines: 81, Hobbies: []string{"Footbal", "Hunting", "Coding"}}

func HomePage(w http.ResponseWriter, _ *http.Request) {
    t, err := template.ParseFiles("templates/home.gohtml", header, footer)

    if err != nil {
        _, _ = fmt.Fprintf(w, err.Error())
        return
    }

    /* one := db.FindOne("signa", bson.D{{"img", "maryanaro.png"}})

       var result structs.Signa

       if err := one.Decode(&result); err != nil {
           _, _ = fmt.Fprintf(w, err.Error())
           return
       } */

    bob.SetName("Alex")
    // fmt.Printf("Found a single document: %+v\n", result)
    if err = t.ExecuteTemplate(w, "index", bob); err != nil {
        _, _ = fmt.Fprintf(w, err.Error())
    }
}

func ContactsPage(conn structs.Connection) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        t, err := template.ParseFiles("templates/contacts.gohtml", header, footer)

        if err != nil {
            _, _ = fmt.Fprintf(w, err.Error())
            return
        }

        var output []structs.StringifiedSigna
        var result []structs.Signa
        var cursor *mongo.Cursor

        cursor, err = db.Find("signa", bson.D{})

        defer db.CloseCursor(cursor)

        if err != nil {
            _, _ = fmt.Fprintf(w, err.Error())
            return

        } else if err = cursor.All(conn.Ctx, &result); err != nil {
            _, _ = fmt.Fprintf(w, err.Error())
            return
        }

        for _, s := range result {
            output = append(output, s.SignToString())
        }

        if err = t.ExecuteTemplate(w, "contacts", output); err != nil {
            _, _ = fmt.Fprintf(w, err.Error())
        }
    })
}

func AboutPage(w http.ResponseWriter, _ *http.Request) {
    t, err := template.ParseFiles("templates/about.gohtml", header, footer)

    if err != nil {
        _, _ = fmt.Fprintf(w, err.Error())
        return
    }

    if err = t.ExecuteTemplate(w, "about", nil); err != nil {
        _, _ = fmt.Fprintf(w, err.Error())
    }
}

func SignaPage(w http.ResponseWriter, r *http.Request) {
    t, err := template.ParseFiles("templates/signa.gohtml", header, footer)

    if err != nil {
        _, _ = fmt.Fprintf(w, err.Error())
        return
    }

    id := structs.DocId(mux.Vars(r)["id"])
    one := db.FindOne("signa", bson.M{"_id": id})

    var result structs.Signa

    if err := one.Decode(&result); err != nil {
        _, _ = fmt.Fprintf(w, err.Error())
        return
    }

    // fmt.Printf("Found a single document: %+v\n", result)
    if err = t.ExecuteTemplate(w, "signa", result.SignToString()); err != nil {
        _, _ = fmt.Fprintf(w, err.Error())
    }
}

func AddSignaPage(w http.ResponseWriter, _ *http.Request) {
    t, err := template.ParseFiles("templates/add-sign.gohtml", header, footer)

    if err != nil {
        _, _ = fmt.Fprintf(w, err.Error())
        return
    }

    if err = t.ExecuteTemplate(w, "add-sign", nil); err != nil {
        _, _ = fmt.Fprintf(w, err.Error())
    }
}

func AddSignaPost(w http.ResponseWriter, r *http.Request) {
    post := structs.CreateSign(
        r.FormValue("img"),
        r.FormValue("x"),
        r.FormValue("y"),
        r.FormValue("angle"),
        r.FormValue("font"),
        r.FormValue("size"),
        r.FormValue("color"),
    )

    _, err := db.InsertOne("signa", post)

    if err != nil {
        http.Redirect(w, r, "/signa", http.StatusBadRequest)
    } else {
        http.Redirect(w, r, "/contacts", http.StatusSeeOther)
    }
}
