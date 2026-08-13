import { useEffect, useRef, useState } from 'react';
import { FaBell, FaBellSlash } from 'react-icons/fa';

const playChime = async (audioContextRef) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const context = audioContextRef.current || new AudioContext();
    audioContextRef.current = context;
    if (context.state === 'suspended') await context.resume();

    const start = context.currentTime;
    [659.25, 880].forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        const noteStart = start + index * 0.13;

        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(0.18, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.28);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(noteStart);
        oscillator.stop(noteStart + 0.3);
    });
};

const unlockAudio = async (audioContextRef) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = audioContextRef.current || new AudioContext();
    audioContextRef.current = context;
    if (context.state === 'suspended') await context.resume();
};

export const BalloonAlerts = ({ balloons, teams, problems, sites, pendingField, audience }) => {
    const knownIdsRef = useRef(null);
    const audioContextRef = useRef(null);
    const [alertsEnabled, setAlertsEnabled] = useState(true);
    const [notificationPermission, setNotificationPermission] = useState(
        'Notification' in window ? Notification.permission : 'unsupported'
    );

    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/notification-sw.js').catch(() => {});
        }
    }, []);

    useEffect(() => {
        const prepareAudio = () => {
            if (!alertsEnabled) return;
            unlockAudio(audioContextRef).catch(() => {});
            if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission().then(setNotificationPermission);
            }
        };
        document.addEventListener('pointerdown', prepareAudio, { once: true });
        document.addEventListener('keydown', prepareAudio, { once: true });

        return () => {
            document.removeEventListener('pointerdown', prepareAudio);
            document.removeEventListener('keydown', prepareAudio);
        };
    }, [alertsEnabled]);

    useEffect(() => {
        const currentIds = new Set(balloons.map(balloon => balloon.id));

        if (knownIdsRef.current === null) {
            knownIdsRef.current = currentIds;
            return;
        }

        const arrivals = balloons.filter(balloon =>
            !knownIdsRef.current.has(balloon.id) && !balloon[pendingField]
        );
        knownIdsRef.current = currentIds;
        if (arrivals.length === 0) return;

        const newest = arrivals.reduce((latest, balloon) =>
            (balloon.timestamp ?? 0) > (latest.timestamp ?? 0) ? balloon : latest
        );
        const team = teams.find(item => item.id === newest.teamId);
        const problem = problems.find(item => item.id === newest.problemId);
        const site = sites.find(item => item.id === newest.siteId);
        const teamName = team?.displayName || team?.name || 'Unknown team';
        const problemName = problem?.fullName || `Problem ${problem?.name || '?'}`;
        const title = arrivals.length > 1
            ? `${arrivals.length} new first accepted balloons`
            : 'New first accepted balloon';
        const message = `${teamName} · ${problemName}${site ? ` · ${site.name}` : ''}`;

        if (alertsEnabled) {
            playChime(audioContextRef).catch(() => {});
            navigator.vibrate?.([250, 120, 250, 120, 400]);
        }
        if (alertsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            const notificationOptions = {
                body: message,
                tag: `balloon-${newest.id}`,
                icon: '/favicon.png',
                badge: '/favicon.png',
                requireInteraction: true,
                renotify: true,
                silent: false,
                vibrate: [250, 120, 250, 120, 400],
                timestamp: Date.now(),
                data: { url: window.location.href },
            };
            try {
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.ready
                        .then(registration => registration.showNotification(title, notificationOptions))
                        .catch(() => new Notification(title, notificationOptions));
                } else {
                    new Notification(title, notificationOptions);
                }
            } catch {
                // The in-app alert and audio remain available on browsers with limited notification options.
            }
        }
    }, [alertsEnabled, balloons, pendingField, problems, sites, teams]);

    const enableAlerts = async () => {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
        }
        await playChime(audioContextRef).catch(() => {});
        setAlertsEnabled(true);
    };

    const handleAlertControl = () => {
        if (!alertsEnabled || notificationPermission === 'default') {
            enableAlerts();
            return;
        }
        setAlertsEnabled(false);
    };

    const buttonLabel = !alertsEnabled
        ? 'Enable alerts'
        : notificationPermission === 'default'
            ? 'Allow background alerts'
            : notificationPermission === 'denied'
                ? 'Sound alerts on'
                : 'Background alerts on';

    return (
        <div className="alert-controls" aria-label={`${audience} notification controls`}>
            <button
                type="button"
                className={alertsEnabled ? 'alerts-button enabled' : 'alerts-button'}
                onClick={handleAlertControl}
                aria-pressed={alertsEnabled}
            >
                {alertsEnabled ? <FaBell aria-hidden="true" /> : <FaBellSlash aria-hidden="true" />}
                {buttonLabel}
            </button>
        </div>
    );
};
