import { useState, useRef, useEffect } from "react"
import AudioPlayer, { playAudio, stopAudio } from "../../AudioPlayer"
import { ReactComponent as ResetIcon } from "../../../assets/icons/resetIcon.svg"
import "./Timer.css"
import TimerSettings from "./TimerSettings"
const timerSpeed = 1000 // ms

export function Timer() {
  const [breakLength, setBreakLength] = useState(5)
  const [sessionLength, setSessionLength] = useState(25)
  const [timer, setTimer] = useState(60 * sessionLength)
  const [pause, setPause] = useState(true)
  const [timerStatus, setTimerStatus] = useState("session")
  const [sessionNum, setSessionNum] = useState(1)
  const intervalIdRef = useRef(null)

  const formatTime = (length) => {
    const minutes = Math.floor(length / 60)
    const seconds = length % 60

    const formattedMinutes = String(minutes).padStart(2, "0")
    const formattedSeconds = String(seconds).padStart(2, "0")
    return `${formattedMinutes}:${formattedSeconds}`
  }

  const resetTimer = () => {
    stopInterval()
    stopAudio()
    setSessionLength(25)
    setBreakLength(5)
    setTimer(25 * 60)
    setSessionNum(1)
    setPause(true)
    setTimerStatus("session")
  }

  const stopInterval = () => {
    clearInterval(intervalIdRef.current)
    intervalIdRef.current = null
  }

  const setBreak = () => {
    setTimer(breakLength * 60)
    setSessionNum((prevNum) => prevNum + 1)
    setTimerStatus("break")
  }

  const setSession = () => {
    setTimer(sessionLength * 60)
    setTimerStatus("session")
  }

  const handleStartPause = () => {
    if (intervalIdRef.current !== null) {
      stopInterval()
      setPause(true)
      return
    }

    stopAudio()

    const id = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 0) {
          playAudio()
          setTimerStatus((prevStatus) => {
            prevStatus === "session" ? setBreak() : setSession()
          })
          return
        }

        setPause && setPause(false)
        setTimer(prevTimer - 1)
        return prevTimer - 1
      })
    }, timerSpeed)

    intervalIdRef.current = id
  }

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      clearInterval(intervalIdRef.current)
    }
  }, [])

  useEffect(() => {
    document.title = `${formatTime(timer)} - Pomodoro Timer | osmangund`
  }, [timer])

  useEffect(() => {
    if (timerStatus === "session") return setTimer(sessionLength * 60)
    if (timerStatus === "break") return setTimer(breakLength * 60)
  }, [sessionLength, timerStatus, breakLength])

  return (
    <div id="timer">
      <div id="timer-label">
        <p id="timer-display">
          {timerStatus === "session" ? (
            `Session ${sessionNum}`
          ) : (
            <>
              Break <span id="break-span">Next session: {sessionNum}</span>
            </>
          )}
        </p>
      </div>
      <p id="time-left">{formatTime(timer)}</p>

      <AudioPlayer />

      <button id="start_stop" onClick={() => handleStartPause()}>
        {pause ? "start" : "pause"}
      </button>
      <button id="reset-icon" onClick={() => resetTimer()}>
        <ResetIcon className="icon" />
      </button>

      <TimerSettings
        sessionLength={sessionLength}
        breakLength={breakLength}
        setSessionLength={(value) => setSessionLength(value)}
        setBreakLength={(value) => setBreakLength(value)}
      />
    </div>
  )
}
