package session

import "server/internal/utils"

type Data struct {
    UserId uint32
}

type Session struct {
    data map[string]*Data
}

func NewSession() Session {
    return Session{data: make(map[string]*Data)}
}

func (s *Session) Init(uid uint32) (string, error) {
    sid, err := utils.GenerateId()
    if err != nil {
        return "", err
    }

    data := &Data{UserId: uid}
    s.data[sid] = data

    return sid, nil
}

func (s *Session) Get(sid string) uint32 {
    data := s.data[sid]

    if data == nil {
        return 0
    }

    return data.UserId
}
