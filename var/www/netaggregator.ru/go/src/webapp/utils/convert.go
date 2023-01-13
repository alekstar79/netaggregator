package utils

import "strconv"

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
