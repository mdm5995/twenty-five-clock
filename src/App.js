import {useState, useEffect, useRef} from 'react';
import beep from './audio/alarm-finished-beeps.mp3';
import './App.css';

// courtesy Dan Abramov
// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
		const tick = () => {
      savedCallback.current();
    }

		if (delay !== null) {
			const id = setInterval(tick, delay);
			return () => clearInterval(id);
		}
  }, [delay]);
}

const App = () => {
	// times always stored in seconds
	const [timerLabel, setTimerLabel] = useState('session');
	const [breakLength, setBreakLength] = useState(5 * 60);
	const [sessionLength, setSessionLength] = useState(25 * 60);
	const [timeLeft, setTimeLeft] = useState((25 * 60));
	const [isTimerRunning, setIsTimerRunning] = useState(false);
	// this doesn't need to be used probably
	const [delay, setDelay] = useState(1000);

	const convertSecondsToMinutesAndSeconds = (time) => {
		if (time < 0) {
			return {
				minutes: '00',
				seconds: '00'
			}
		}
		let minutes = Math.floor(time / 60);
		if (minutes < 10) {
			minutes = '0' + minutes;
		}

		let seconds;
		if (time - (minutes * 60) < 10) {
			seconds = `0${time - (minutes * 60)}`;
		} else {
			seconds = time - (minutes * 60);
		}
		const convertedTime = {
			minutes: minutes,
			seconds: seconds,
		}
		return convertedTime;
	}

	const stringifyConvertedTime = (convertedTime) => {
		return `${convertedTime.minutes}:${convertedTime.seconds}`
	}

	const getMinutes = (convertedTime) => {
		return parseInt(convertedTime.minutes);
	}

	const reset = () => {
		const beepElem = document.getElementById('beep')
		beepElem.pause();
		beepElem.currentTime = 0;
		setBreakLength(5 * 60);
		setSessionLength(25 * 60);
		setTimeLeft(25 * 60);
		setTimerLabel('session');
		setIsTimerRunning(false);
		return null;
	}

	const incrementLength = (type) => {
		switch(type) {
			case 'break':
				if (breakLength < (60 * 60)) {
					setBreakLength(breakLength => breakLength + 60);
				}
				break;
			case 'session':
				if (sessionLength < (60 * 60)) {
					setSessionLength(sessionLength => sessionLength + 60);
				}
				break;
			default:
				return;
		}
		// increase break length but no greater than 60 minutes
	}

	const decrementLength = (type) => {
		switch(type) {
			case 'break':
				if (breakLength > 60) {
					setBreakLength(breakLength => breakLength - 60);
				}
				break;
			case 'session':
				if (sessionLength > 60) {
					setSessionLength(sessionLength => sessionLength - 60);
				}
				break;
			default:
				return;
		}
		// decrease break length but no less than 1 minute
	}

	const toggleTimer = () => {
		setIsTimerRunning(!isTimerRunning);
		return null;
	}

	// set timeLeft to appropriate amount on button clicks
	useEffect(() => {
		if (timerLabel === 'session') {
			setTimeLeft(sessionLength);
			return;
		}
	}, [timerLabel, sessionLength])

	useEffect(() => {
		if (timerLabel === 'break') {
			setTimeLeft(breakLength);
			return;
		}
	}, [timerLabel, breakLength])

	// countdown effect
	useInterval(() => {
		if (timeLeft > 0) {
			setTimeLeft(timeLeft - 1);
			return;
		}

		if (timeLeft === 0) {
			const beepElem = document.getElementById('beep')
			beepElem.pause();
			beepElem.currentTime = 0;
			beepElem.play();
			if (timerLabel === 'session') {
				setTimerLabel('break');
				setTimeLeft(breakLength);
				return;
			}

			if (timerLabel === 'break') {
				setTimerLabel('session');
				setTimeLeft(sessionLength);
				return;
			}
		}
	}, isTimerRunning ? delay : null)

  return (
		<div id='container'>
			<audio id="beep" src={beep}></audio>
			<h3 id='timer-label'>{timerLabel}</h3>
			<div id='time-left'>{stringifyConvertedTime(convertSecondsToMinutesAndSeconds(timeLeft))}</div>
			<h3 id='break-label'>break length</h3>
			<button id='break-decrement' onClick={() => decrementLength('break')}>
				<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-corner-left-down">
				<polyline points="14 15 9 20 4 15"/>
				<path d="M20 4h-7a4 4 0 0 0-4 4v12"/>
				</svg>
			</button>
			<div id='break-length'>{getMinutes(convertSecondsToMinutesAndSeconds(breakLength))}</div>
			<button id='break-increment' onClick={() => incrementLength('break')}>
				<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-corner-right-up">
					<polyline points="10 9 15 4 20 9"/>
					<path d="M4 20h7a4 4 0 0 0 4-4V4"/>
				</svg>
			</button>
			<h3 id='session-label'>session length</h3>
			<button id='session-decrement' onClick={() => decrementLength('session')}>
				<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-corner-left-down">
				<polyline points="14 15 9 20 4 15"/>
				<path d="M20 4h-7a4 4 0 0 0-4 4v12"/>
				</svg>
			</button>
			<div id='session-length'>{getMinutes(convertSecondsToMinutesAndSeconds(sessionLength))}</div>
			<button id='session-increment' onClick={() => incrementLength('session')}>
				<svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-corner-right-up">
					<polyline points="10 9 15 4 20 9"/>
					<path d="M4 20h7a4 4 0 0 0 4-4V4"/>
				</svg>
			</button>
			<button id='start_stop' onClick={toggleTimer}>start_stop</button>
			<button id='reset' onClick={reset}>reset</button>
		</div>
  );
}

export default App;
