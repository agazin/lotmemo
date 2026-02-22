/**
 * Parses betting shortcodes into structured data.
 *
 * === Core formats ===
 * 123=100x100    -> 3TOP 100, 3TOAD 100
 * 123=100=       -> 3TOP 100
 * =25=100        -> 2BOTTOM 100  (leading = means bottom)
 * 123=100        -> 3TOP 100 (default for 3 digits)
 * 25=100         -> 2TOP 100 (default for 2 digits)
 * 5=100          -> RUNNING_TOP 100 (default for 1 digit)
 *
 * === Extended shortcodes (prefixed with *) ===
 * *กลับ123=100       -> all permutations of 123 as 3TOP 100 each  (6 กลับ for 3-digit)
 * *กลับ12=100        -> 12 + 21 as 2TOP 100 each
 * *19ประตู5=100      -> 05,15,25,...,95 as 2TOP 100 each (19 ประตู)
 * *19ประตู5=100x50   -> same but 2TOP 100 + 2BOTTOM 50 each
 * *รูดหน้า1=100      -> 10,11,...,19 as 2TOP 100 each
 * *รูดหลัง1=100      -> 01,11,...,91 as 2TOP 100 each
 *
 * === Multi-bet (semicolon separated) ===
 * 123=100x100;456=50  -> multiple bets in one input
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** All unique permutations of a string of digits */
function uniquePermutations(str) {
    if (str.length <= 1) return [str];
    const result = new Set();
    for (let i = 0; i < str.length; i++) {
        const rest = str.slice(0, i) + str.slice(i + 1);
        for (const perm of uniquePermutations(rest)) {
            result.add(str[i] + perm);
        }
    }
    return [...result];
}

/** Determine the default bet type based on number of digits */
function defaultType(numDigits, isBottom = false) {
    if (numDigits === 3) return isBottom ? '3BOTTOM' : '3TOP';
    if (numDigits === 2) return isBottom ? '2BOTTOM' : '2TOP';
    if (numDigits === 1) return isBottom ? 'RUNNING_BOTTOM' : 'RUNNING_TOP';
    return '3TOP';
}

// ---------------------------------------------------------------------------
// Parse a SINGLE shortcode token (no semicolons)
// ---------------------------------------------------------------------------
function parseSingleBet(input) {
    if (!input) return null;
    const clean = input.replace(/\s/g, '');

    // --- Extended shortcodes (start with *) ---
    if (clean.startsWith('*')) {
        return parseExtended(clean.slice(1));
    }

    // --- Bottom-only: =NUM=AMT ---
    if (clean.startsWith('=')) {
        const parts = clean.slice(1).split('=');
        if (parts.length < 2) return null;
        const number = parts[0];
        const amount = parseInt(parts[1], 10);
        if (!number || isNaN(amount) || amount <= 0) return null;
        return [{ number, type: defaultType(number.length, true), amount }];
    }

    // --- Standard: NUM=AMT or NUM=AMTxAMT or NUM=AMT= ---
    const parts = clean.split('=');
    const number = parts[0];
    if (!number || !/^\d+$/.test(number)) return null;

    // NUM=AMTxAMT  (Top x Toad)
    if (parts.length >= 2 && parts[1] && parts[1].includes('x')) {
        const amounts = parts[1].split('x');
        const topAmount = parseInt(amounts[0], 10);
        const toadAmount = parseInt(amounts[1], 10);

        const bets = [];
        if (!isNaN(topAmount) && topAmount > 0) {
            bets.push({ number, type: defaultType(number.length, false), amount: topAmount });
        }
        if (!isNaN(toadAmount) && toadAmount > 0) {
            if (number.length === 3) {
                bets.push({ number, type: '3TOAD', amount: toadAmount });
            } else if (number.length === 2) {
                bets.push({ number, type: '2BOTTOM', amount: toadAmount });
            } else {
                bets.push({ number, type: 'RUNNING_BOTTOM', amount: toadAmount });
            }
        }
        return bets.length ? bets : null;
    }

    // NUM=AMT=  (explicit top only, trailing =)
    if (parts.length === 3 && parts[2] === '') {
        const amount = parseInt(parts[1], 10);
        if (isNaN(amount) || amount <= 0) return null;
        return [{ number, type: defaultType(number.length, false), amount }];
    }

    // NUM=AMT  (simple)
    if (parts.length === 2) {
        const amount = parseInt(parts[1], 10);
        if (isNaN(amount) || amount <= 0) return null;
        return [{ number, type: defaultType(number.length, false), amount }];
    }

    return null;
}

// ---------------------------------------------------------------------------
// Parse extended shortcodes  (already stripped leading *)
// ---------------------------------------------------------------------------
function parseExtended(raw) {
    // *กลับ123=100           -> permutations of 123, 3TOP 100
    // *กลับ123=100x50        -> permutations of 123, 3TOP 100 + 3TOAD 50
    const flipMatch = raw.match(/^กลับ(\d+)=(.+)$/);
    if (flipMatch) {
        const digits = flipMatch[1];
        const perms = uniquePermutations(digits);
        const amountStr = flipMatch[2];
        const bets = [];
        for (const num of perms) {
            const parsed = parseSingleBet(`${num}=${amountStr}`);
            if (parsed) bets.push(...parsed);
        }
        return bets.length ? bets : null;
    }

    // *19ประตูD=AMT  or  *19ประตูD=AMTxAMT  (D can be 1+ digits)
    const gate19Match = raw.match(/^19ประตู(\d+)=(.+)$/);
    if (gate19Match) {
        const digits = gate19Match[1];
        const amountStr = gate19Match[2];

        // Multi-digit (2+): parse as standard bet directly
        if (digits.length >= 2) {
            return parseSingleBet(`${digits}=${amountStr}`);
        }

        // Single digit: generate 19-door pairs (D0-D9 + 0D-9D)
        const d = digits;
        const bets = [];
        for (let i = 0; i <= 9; i++) {
            const num1 = `${d}${i}`;
            const num2 = `${i}${d}`;
            // forward
            const p1 = parseSingleBet(`${num1}=${amountStr}`);
            if (p1) bets.push(...p1);
            // reverse (skip if same as forward, e.g. 55)
            if (num1 !== num2) {
                const p2 = parseSingleBet(`${num2}=${amountStr}`);
                if (p2) bets.push(...p2);
            }
        }
        return bets.length ? bets : null;
    }

    // *รูดหน้าD=AMT   -> D0, D1, ..., D9 as 2TOP (D can be 1+ digits)
    const frontMatch = raw.match(/^รูดหน้า(\d+)=(.+)$/);
    if (frontMatch) {
        const digits = frontMatch[1];
        const amountStr = frontMatch[2];

        // Multi-digit (2+): parse as standard bet directly
        if (digits.length >= 2) {
            return parseSingleBet(`${digits}=${amountStr}`);
        }

        const d = digits;
        const bets = [];
        for (let i = 0; i <= 9; i++) {
            const num = `${d}${i}`;
            const p = parseSingleBet(`${num}=${amountStr}`);
            if (p) bets.push(...p);
        }
        return bets.length ? bets : null;
    }

    // *รูดหลังD=AMT   -> 0D, 1D, ..., 9D as 2TOP (D can be 1+ digits)
    const backMatch = raw.match(/^รูดหลัง(\d+)=(.+)$/);
    if (backMatch) {
        const digits = backMatch[1];
        const amountStr = backMatch[2];

        // Multi-digit (2+): parse as standard bet directly
        if (digits.length >= 2) {
            return parseSingleBet(`${digits}=${amountStr}`);
        }

        const d = digits;
        const bets = [];
        for (let i = 0; i <= 9; i++) {
            const num = `${i}${d}`;
            const p = parseSingleBet(`${num}=${amountStr}`);
            if (p) bets.push(...p);
        }
        return bets.length ? bets : null;
    }

    return null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Main entry point – supports semicolon-separated multi-bets.
 * Returns an array of bet objects or null.
 */
export const parseBet = (input) => {
    if (!input) return null;
    const clean = input.replace(/\s/g, '');
    if (!clean) return null;

    const tokens = clean.split(';').filter(Boolean);
    const allBets = [];

    for (const token of tokens) {
        const bets = parseSingleBet(token);
        if (bets) allBets.push(...bets);
    }

    return allBets.length ? allBets : null;
};

/**
 * Format bet type code into Thai label
 */
export const formatBetType = (type) => {
    const map = {
        '3TOP': '3 ตัวบน',
        '3TOAD': '3 ตัวโต๊ด',
        '3BOTTOM': '3 ตัวล่าง',
        '3FRONT': '3 ตัวหน้า',
        '2TOP': '2 ตัวบน',
        '2BOTTOM': '2 ตัวล่าง',
        'RUNNING_TOP': 'วิ่งบน',
        'RUNNING_BOTTOM': 'วิ่งล่าง',
    };
    return map[type] || type;
};

/**
 * All valid bet types
 */
export const BET_TYPES = [
    '3TOP', '3TOAD', '3BOTTOM', '3FRONT',
    '2TOP', '2BOTTOM',
    'RUNNING_TOP', 'RUNNING_BOTTOM',
];
