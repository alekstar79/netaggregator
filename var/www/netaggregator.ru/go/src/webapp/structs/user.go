package structs

import "fmt"

type User struct {
	Name          string
	Age           uint16
	Money         int16
	Avg, Happines float64
	Hobbies       []string
}

func (u *User) GetInfo() string {
	return fmt.Sprintf("User %s age %d", u.Name, u.Age)
}

func (u *User) SetName(name string) {
	u.Name = name
}
