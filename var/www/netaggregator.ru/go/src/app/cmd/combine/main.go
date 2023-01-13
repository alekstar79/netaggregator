// https://question-it.com/questions/1668964/golang-kak-obedinjat-dobavljat-izobrazhenija-drug-v-druga

package main

import (
    "image"
    "image/color"
    "image/draw"
    "image/png"
    "os"

    "server/internal/utils"
)

// Pixel Create a struct to deal with pixel
type Pixel struct {
    Point image.Point
    Color color.Color
}

// OpenAndDecode Keep it DRY so don't have to repeat opening file and decode
func OpenAndDecode(filepath string) (image.Image, string, error) {
    imgFile, err := os.Open(filepath)
    if err != nil {
        return nil, "", err
    }

    defer imgFile.Close()

    img, format, err := image.Decode(imgFile)
    if err != nil {
        return nil, "", err
    }

    return img, format, nil
}

// DecodePixelsFromImage Decode image.Image's pixel data into []*Pixel
func DecodePixelsFromImage(img image.Image, offsetX, offsetY int) []*Pixel {
    var pixels []*Pixel

    for y := 0; y <= img.Bounds().Max.Y; y++ {
        for x := 0; x <= img.Bounds().Max.X; x++ {
            p := &Pixel{
                Point: image.Point{X: x + offsetX, Y: y + offsetY},
                Color: img.At(x, y),
            }
            pixels = append(pixels, p)
        }
    }

    return pixels
}

func main() {
    img1, _, err := OpenAndDecode(utils.Root("assets/makey.png"))
    if err != nil {
        panic(err)
    }
    img2, _, err := OpenAndDecode(utils.Root("assets/sample.png"))
    if err != nil {
        panic(err)
    }

    // collect pixel data from each image
    pixels1 := DecodePixelsFromImage(img1, 0, 0)
    // the second image has a X-offset of img1's max X (appended at right)
    pixels2 := DecodePixelsFromImage(img2, img1.Bounds().Max.X, 0)
    pixelSum := append(pixels1, pixels2...)

    // Set a new size for the new image equal to the max width
    // of bigger image and max height of two images combined
    newRect := image.Rectangle{
        Min: img1.Bounds().Min,
        Max: image.Point{
            X: img2.Bounds().Max.X + img1.Bounds().Max.X,
            Y: img2.Bounds().Max.Y,
        },
    }

    img := image.NewRGBA(newRect)
    // This is the cool part, all you have to do is loop through
    // each Pixel and set the image's color on the go
    for _, px := range pixelSum {
        img.Set(px.Point.X, px.Point.Y, px.Color)
    }

    draw.Draw(img, img.Bounds(), img, image.Point{}, draw.Src)

    // Create a new file and write to it
    out, err := os.Create(utils.Root("cmd/combine/output.png"))
    if err != nil {
        panic(err)
    }

    err = png.Encode(out, img)
    if err != nil {
        panic(err)
    }
}
