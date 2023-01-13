package utils

import (
    "crypto/rand"
    "fmt"
    "image/color"
    "log"
    "os"
    "regexp"
    "strconv"
)

var (
    re = regexp.MustCompile("^([\\w/]+)/(cmd|internal)/.*")
	pwd string
    err error
)

func Root(f string) string {
    if pwd, err = os.Getwd(); err != nil {
        log.Fatal(err)
    }

    if re.MatchString(pwd) {
        pwd = re.ReplaceAllString(pwd, "$1")
    }

    return fmt.Sprintf("%s/%s", pwd, f)
}

func strToInt(str string) int {
    num, err := strconv.Atoi(str)

    if err != nil {
        panic(err)
    }

    return num
}

func StrToUint32(str string) uint32 {
    num := strToInt(str)

    return uint32(num)
}

func StrToInt32(str string) int32 {
    num := strToInt(str)

    return int32(num)
}

func Hex2RGBA(hex string) (color.RGBA, error) {
    values, err := strconv.ParseUint(hex, 16, 32)
    if err != nil {
        return color.RGBA{}, err
    }

    return color.RGBA{
        R: uint8(values >> 16),
        G: uint8((values >> 8) & 0xFF),
        B: uint8(values & 0xFF),
        A: 255,
    }, nil
}

func GenerateId() (string, error) {
    b := make([]byte, 16)

    _, err := rand.Read(b)
    if err != nil {
        return "", err
    }

    return fmt.Sprintf("%x", b), nil
}
