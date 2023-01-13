package config

type Server struct {
    Host string `env:"HOST" env-default:"0.0.0.0"`
    Port string `env:"PORT" env-default:"8080"`

    MongoUrl string `env:"MONGO_URL"`
    JokeURL string `env:"JOKE_URL"`
}
