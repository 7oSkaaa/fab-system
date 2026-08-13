import { useCallback, useEffect, useRef, useState } from 'react';
import { FaBell, FaBellSlash, FaMobileAlt } from 'react-icons/fa';
import { getPushSupport, listenForForegroundPush, subscribeToPush } from '../services/pushNotifications';

const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

const playChime = async audioContextRef => {
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
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, noteStart);
        gain.gain.linearRampToValueAtTime(0.2, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.3);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(noteStart);
        oscillator.stop(noteStart + 0.32);
    });
};

export const BalloonAlerts = ({ audience }) => {
    const audioContextRef = useRef(null);
    const unsubscribeRef = useRef(null);
    const [status, setStatus] = useState(isIos && !isStandalone ? 'install' : 'checking');
    const [error, setError] = useState('');

    const activatePush = useCallback(async () => {
        setError('');
        setStatus('enabling');
        try {
            await playChime(audioContextRef);
            const { messaging, registration } = await subscribeToPush(audience);
            unsubscribeRef.current?.();
            unsubscribeRef.current = listenForForegroundPush(messaging, payload => {
                playChime(audioContextRef).catch(() => {});
                navigator.vibrate?.([250, 120, 250, 120, 400]);
                const notification = payload.notification || {};
                registration.showNotification(notification.title || 'New first accepted balloon', {
                    body: notification.body || 'Open FAB System for details.',
                    icon: '/favicon.png',
                    badge: '/favicon.png',
                    requireInteraction: true,
                    tag: payload.messageId || 'fab-balloon',
                    data: { url: window.location.href },
                });
            });
            setStatus('ready');
        } catch (activationError) {
            setError(activationError.message);
            setStatus('error');
        }
    }, [audience]);

    useEffect(() => {
        if (isIos && !isStandalone) return undefined;
        let cancelled = false;
        getPushSupport().then(support => {
            if (cancelled) return;
            if (!support.configured) setStatus('unconfigured');
            else if (!support.supported) setStatus('unsupported');
            else if (Notification.permission === 'granted') activatePush();
            else setStatus('permission');
        });
        return () => {
            cancelled = true;
            unsubscribeRef.current?.();
        };
    }, [activatePush]);

    if (status === 'install') {
        return (
            <div className="push-setup-card" role="status">
                <FaMobileAlt aria-hidden="true" />
                <div>
                    <strong>Install FAB for background alerts</strong>
                    <span>Tap Share, choose “Add to Home Screen,” then open FAB from its new icon.</span>
                </div>
            </div>
        );
    }

    const ready = status === 'ready';
    const buttonText = ready ? 'Background alerts on' : status === 'enabling' ? 'Enabling…' : 'Enable background alerts';

    return (
        <div className="alert-controls" aria-label={`${audience} notification controls`}>
            <button
                type="button"
                className={ready ? 'alerts-button enabled' : 'alerts-button'}
                onClick={activatePush}
                disabled={status === 'enabling' || status === 'unsupported' || status === 'unconfigured'}
                aria-pressed={ready}
            >
                {ready ? <FaBell aria-hidden="true" /> : <FaBellSlash aria-hidden="true" />}
                {buttonText}
            </button>
            {error && <span className="push-error" role="status">{error}</span>}
            {status === 'unconfigured' && <span className="push-error">Push server setup is required.</span>}
            {status === 'unsupported' && <span className="push-error">Background notifications are not supported in this browser.</span>}
        </div>
    );
};
