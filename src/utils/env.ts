function env(envVar: string, fallback?: string): string | null {
    return process.env[envVar] || fallback || null;
}

function envRequired(envVar: string, fallback?: string): string {
    const ret = env(envVar, fallback);

    if (!ret) {
        if (fallback === undefined) {
            throw new Error(`Missing ${envVar} in env`);
        }

        return fallback;
    }

    return ret;
}

export const DATABASE_URL = envRequired('DATABASE_URL');
