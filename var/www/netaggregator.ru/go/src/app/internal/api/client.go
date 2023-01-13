package api

type Client interface {
    GetJoke() (*JokeResponse, error)
}
