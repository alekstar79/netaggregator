package config

type Server struct {
	Port string `yaml:"port" env:"PORT"`
	Host string `yaml:"host" env:"HOST" env-default:"0.0.0.0"`

	JokeURL    string `yaml:"joke-url" env:"JOKE_URL"`
	CustomJoke string `env:"CUSTOM_JOKE"`
}
