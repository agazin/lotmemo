'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LimitContext = createContext();

export function LimitProvider({ children }) {
    const [settings, setSettings] = useState({
        defaultOdds: {
            '3TOP': 900,
            '3TOAD': 150,
            '3BOTTOM': 450,
            '3FRONT': 300,
            '2TOP': 90,
            '2BOTTOM': 90,
            'RUNNING_TOP': 3.2,
            'RUNNING_BOTTOM': 4.2,
        },
        closedNumbers: {},    // { "123": { type: "CLOSED" | "HALF", limit: 0 } }
        ceilingLimits: {      // default max per type
            '3TOP': 100000,
            '3TOAD': 100000,
            '3BOTTOM': 100000,
            '3FRONT': 100000,
            '2TOP': 50000,
            '2BOTTOM': 50000,
            'RUNNING_TOP': 20000,
            'RUNNING_BOTTOM': 20000,
        },
        numberLimits: {},     // per-number specific limits: { "123": { maxAmount: 50000 } }
        timeSetting: {        // เวลาเปิด/ปิดรับ
            open: '06:00',
            close: '14:30',
        },
        announcements: '',    // ข้อความประกาศ
    });

    useEffect(() => {
        const storedSettings = localStorage.getItem('limitSettings');
        if (storedSettings) {
            try {
                const parsed = JSON.parse(storedSettings);
                setSettings(prev => ({ ...prev, ...parsed }));
            } catch {
                // ignore parse errors
            }
        }
    }, []);

    const updateSettings = (newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        localStorage.setItem('limitSettings', JSON.stringify(updated));
    };

    const addClosedNumber = (number, type = 'CLOSED', limit = 0) => {
        updateSettings({
            closedNumbers: {
                ...settings.closedNumbers,
                [number]: { type, limit },
            },
        });
    };

    const removeClosedNumber = (number) => {
        const updated = { ...settings.closedNumbers };
        delete updated[number];
        updateSettings({ closedNumbers: updated });
    };

    /** Set per-number max amount */
    const setNumberLimit = (number, maxAmount) => {
        updateSettings({
            numberLimits: {
                ...settings.numberLimits,
                [number]: { maxAmount },
            },
        });
    };

    const removeNumberLimit = (number) => {
        const updated = { ...settings.numberLimits };
        delete updated[number];
        updateSettings({ numberLimits: updated });
    };

    /**
     * Check if a bet is allowed.
     * @param {string} number - the bet number
     * @param {string} type - bet type (3TOP, 2BOTTOM, etc.)
     * @param {number} amount - the bet amount
     * @param {number} currentTotal - existing total for this number+type
     * @returns {{ allowed: boolean, reason?: string, warning?: string, isHalf?: boolean }}
     */
    const checkLimit = (number, type, amount, currentTotal = 0) => {
        // 1. Check closed numbers
        const closed = settings.closedNumbers[number];
        if (closed) {
            if (closed.type === 'CLOSED') {
                return { allowed: false, reason: 'เลขปิด (ไม่รับแทง)' };
            }
            if (closed.type === 'HALF') {
                return { allowed: true, warning: 'เลขอั้น (จ่ายครึ่งราคา)', isHalf: true };
            }
        }

        // 2. Check per-number specific limit
        const numLimit = settings.numberLimits[number];
        if (numLimit && numLimit.maxAmount) {
            if (currentTotal + amount > numLimit.maxAmount) {
                return {
                    allowed: false,
                    reason: `เลขเต็ม — รับได้ ${numLimit.maxAmount.toLocaleString()} ฿ / ยอดปัจจุบัน ${currentTotal.toLocaleString()} ฿`,
                };
            }
            // Warn if approaching limit (>80%)
            if ((currentTotal + amount) / numLimit.maxAmount > 0.8) {
                return {
                    allowed: true,
                    warning: `ใกล้เต็ม — เหลือ ${(numLimit.maxAmount - currentTotal - amount).toLocaleString()} ฿`,
                };
            }
        }

        // 3. Check default ceiling limit per type
        const typeLimit = settings.ceilingLimits[type] || Infinity;
        if (currentTotal + amount > typeLimit) {
            return {
                allowed: false,
                reason: `เกินเพดานรับ (${type}). สูงสุด: ${typeLimit.toLocaleString()} ฿, ปัจจุบัน: ${currentTotal.toLocaleString()} ฿`,
            };
        }

        return { allowed: true };
    };

    /** Check if we are within open hours */
    const isWithinOpenHours = () => {
        const now = new Date();
        const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        return hhmm >= settings.timeSetting.open && hhmm <= settings.timeSetting.close;
    };

    return (
        <LimitContext.Provider value={{
            settings,
            updateSettings,
            addClosedNumber,
            removeClosedNumber,
            setNumberLimit,
            removeNumberLimit,
            checkLimit,
            isWithinOpenHours,
        }}>
            {children}
        </LimitContext.Provider>
    );
}

export function useLimits() {
    return useContext(LimitContext);
}
