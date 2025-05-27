export const API_CONFIG = {
    SUPABASE_URL: 'https://gmrgkccfhmdpucrrfwtf.supabase.co/rest/v1',
    TIMEFOLD_URL: import.meta.env.MODE === 'production'
        ? 'https://thick-susann-timfold-95233258.koyeb.app/schedules/' // Use your actual backend URL here
        : '/timefold-api/schedules', // Local proxy path for development
    ENDPOINTS: {
        EMPLOYEE: '/Employee',
        SHIFT: '/Shift'
    },
    HEADERS: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtcmdrY2NmaG1kcHVjcnJmd3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNjE3ODgsImV4cCI6MjA1NzYzNzc4OH0.EhjlQkmdTS2tdbJB5N6breJuCzQYC8Lg2wM0dzHZpLc',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtcmdrY2NmaG1kcHVjcnJmd3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNjE3ODgsImV4cCI6MjA1NzYzNzc4OH0.EhjlQkmdTS2tdbJB5N6breJuCzQYC8Lg2wM0dzHZpLc',
        'Prefer': 'return=representation'
    }
};