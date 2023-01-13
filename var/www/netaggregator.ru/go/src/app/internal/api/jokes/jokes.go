package jokes

import (
    "encoding/json"
    "fmt"
    "net/http"
    "server/internal/api"
)

type ApiClient struct {
    url string
}

const getJokePath = "/api?format=json"

func NewApiClient(baseUrl string) *ApiClient {
    return &ApiClient{baseUrl}
}

func (c *ApiClient) GetJoke() (*api.JokeResponse, error) {
    urlPath := c.url + getJokePath

    resp, err := http.Get(urlPath)
    if err != nil {
        return nil, err
    } else if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("API request status: %s", http.StatusText(resp.StatusCode))
    }

    var data api.JokeResponse

    err = json.NewDecoder(resp.Body).Decode(&data)
    if err != nil {
        return nil, err
    }

    return &data, nil
}
