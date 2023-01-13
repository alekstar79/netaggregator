// https://kb.objectrocket.com/mongo-db/how-to-find-a-mongodb-document-by-its-bson-objectid-using-golang-452

package structs

import (
    "fmt"
    "log"
    "strconv"

    "go.mongodb.org/mongo-driver/bson/primitive"

    "server/internal/utils"
)

type Signa struct {
    Id        primitive.ObjectID `bson:"_id,omitempty"`
    Img       string             `bson:"img"`
    X         uint32             `bson:"x"`
    Y         uint32             `bson:"y"`
    Angle     int32              `bson:"angle"`
    Font      string             `bson:"font"`
    FontSize  uint32             `bson:"font_size"`
    FontColor string             `bson:"font_color"`
}

type StringifiedSigna struct {
    Id        string
    Img       string
    X         string
    Y         string
    Angle     string
    Font      string
    FontSize  string
    FontColor string
}

func CreateSign(
    img string,
    x string,
    y string,
    angle string,
    font string,
    size string,
    color string,
) Signa {

    return Signa{
        Id:        primitive.NewObjectID(),
        Img:       img,
        X:         utils.StrToUint32(x),
        Y:         utils.StrToUint32(y),
        Angle:     utils.StrToInt32(angle),
        Font:      font,
        FontSize:  utils.StrToUint32(size),
        FontColor: color,
    }
}

func (s Signa) SignToString() StringifiedSigna {
    return StringifiedSigna{
        Id:        s.Id.Hex(),
        Img:       s.Img,
        X:         strconv.Itoa(int(s.X)),
        Y:         strconv.Itoa(int(s.Y)),
        Angle:     strconv.Itoa(int(s.Angle)),
        Font:      s.Font,
        FontSize:  strconv.Itoa(int(s.FontSize)),
        FontColor: s.FontColor,
    }
}

func DocId(hash string) primitive.ObjectID {
    docID, err := primitive.ObjectIDFromHex(hash)

    if err != nil {
        log.Fatal(err)
    }

    return docID
}

func (s StringifiedSigna) ViewSigna() string {
    return fmt.Sprintf("%s, %s, %s, %s", s.Id, s.Img, s.X, s.Y)
}
