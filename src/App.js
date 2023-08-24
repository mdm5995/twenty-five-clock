import {useState, useEffect, useRef} from 'react';
import beep from './audio/beep-01a.mp3';
import './App.css';

// courtesy Dan Abramov
// https://overreacted.io/making-setinterval-declarative-with-react-hooks/
const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

		if (delay !== null) {
			let id = setInterval(tick, delay);
			return () => clearInterval(id);
		}
  }, [delay]);
}

const App = () => {
	/* 
	 * need to track time
	 * need to track session or break flag
	 *
	 * */	

	// times always stored in seconds
	

	const [timerLabel, setTimerLabel] = useState('session');
	const [breakLength, setBreakLength] = useState(5 * 60);
	const [sessionLength, setSessionLength] = useState(25 * 60);
	const [timeLeft, setTimeLeft] = useState((25 * 60));
	const [isTimerRunning, setIsTimerRunning] = useState(false);

	const convertSecondsToMinutesAndSeconds = (time) => {
		const minutes = Math.floor(time / 60);
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
		return convertedTime.minutes;
	}

	const reset = () => {
		setBreakLength(5 * 60);
		setSessionLength(25 * 60);
		setTimeLeft(25 * 60);
		setTimerLabel('session');
		toggleTimer(true);
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

	const toggleTimer = (forceStop = false) => {
		if (forceStop === true) {
			setIsTimerRunning(false);
			return null;
		}
		setIsTimerRunning(!isTimerRunning);
		return null;
	}

	// set timeLeft to appropriate amount on button clicks
	useEffect(() => {
		if (timerLabel === 'session') {
			setTimeLeft(sessionLength);
		}
		if (timerLabel === 'break') {
			setTimeLeft(breakLength);
		}
	}, [timerLabel, breakLength, sessionLength])

	// countdown effect
	useEffect(() => {
		let interval = null;
		console.log(timeLeft);
		console.log(timerLabel);
		if (timeLeft === 0) {
			const beepElem = document.getElementById('beep');
			beepElem.play();
			if (timerLabel === 'session') {
				setTimerLabel('break');
				setTimeLeft(breakLength);
			} else {
				setTimerLabel('session');
				setTimeLeft(sessionLength);
			}

			setIsTimerRunning(false); // Pause the timer
			setTimeout(() => {
				setIsTimerRunning(true); // Resume the timer after 1 second
			}, 1000);
		}


		if (isTimerRunning) {
			interval = setInterval(() => {
				setTimeLeft(prevTimeLeft => {
					if (prevTimeLeft > 0) {
						return prevTimeLeft - 1;
					}
					return prevTimeLeft;
				});
			}, 100);
		} else if (!isTimerRunning) {
			clearInterval(interval);
		}
		return () => clearInterval(interval);
	}, [isTimerRunning, timeLeft, breakLength, sessionLength, timerLabel]);

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
