export const API_CONFIG = {
    SUPABASE_URL: 'https://gmrgkccfhmdpucrrfwtf.supabase.co/rest/v1',
    // Point to the local proxy path instead of the direct URL
    TIMEFOLD_URL: '/timefold-api/schedules', // Use the path defined in vite.config.ts proxy
    ENDPOINTS: {
        EMPLOYEE: '/Employee',
        EMPLOYEE_ROLE: '/EmployeeRole',
        SHIFT: '/Shift'
    },
    HEADERS: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtcmdrY2NmaG1kcHVjcnJmd3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNjE3ODgsImV4cCI6MjA1NzYzNzc4OH0.EhjlQkmdTS2tdbJB5N6breJuCzQYC8Lg2wM0dzHZpLc',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtcmdrY2NmaG1kcHVjcnJmd3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNjE3ODgsImV4cCI6MjA1NzYzNzc4OH0.EhjlQkmdTS2tdbJB5N6breJuCzQYC8Lg2wM0dzHZpLc',
        'Prefer': 'return=representation'
    }
};