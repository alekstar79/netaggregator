package main

import (
    "fmt"
    "github.com/panjf2000/ants/v2"
    "sync"
    "sync/atomic"
    "time"
)

var (
    // Use the common pool
    wg sync.WaitGroup

    runTimes = 1000000
    sum int32
)

func demoFunc1(i interface{}) {
    n := i.(int32)

    atomic.AddInt32(&sum, n)
    fmt.Printf("run with %d\n", n)
}

func demoFunc2() {
    time.Sleep(100 * time.Millisecond)
    fmt.Println("Hello World!")
}


func demo1() {
    syncCalculateSum := func() {
       demoFunc2()
       wg.Done()
    }

    for i := 0; i < runTimes; i++ {
       wg.Add(1)
       _ = ants.Submit(syncCalculateSum)
    }

    wg.Wait()

    fmt.Printf("running goroutines: %d\n", ants.Running())
    fmt.Printf("finish all tasks.\n")
}

// Use the pool with a function,
// set 10 to the capacity of goroutine pool and 1 second for expired duration.
func demo2() {
    p, _ := ants.NewPoolWithFunc(10, func(i interface{}) {
        demoFunc1(i)
        wg.Done()
    })

    defer p.Release()

    // Submit tasks one by one
    for i := 0; i < runTimes; i++ {
        wg.Add(1)
        _ = p.Invoke(int32(i))
    }

    wg.Wait()

    fmt.Printf("running goroutines: %d\n", p.Running())
    fmt.Printf("finish all tasks, result is %d\n", sum)
}

func main() {
    defer ants.Release()

    demo1()
    demo2()
}
