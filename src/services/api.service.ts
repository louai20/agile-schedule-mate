import { API_CONFIG } from '@/config/api.config';

interface Employee {
    EmployeeId: string;
    Name: string;
    work_percentages: number;
    Availability: string;  // Stored as JSON string in database
    employeeRoleId: string;
    created_at: string;
    Skills: string;       // Stored as JSON string in database
    Preferences: string;  // Stored as JSON string in database
}

interface EmployeeRole {
    EmployeeRoleId: string;
    name: string;
    created_at: string;
}

interface Shift {
    ShiftID: string;
    StartTime: string;
    EndTime: string;
    ShiftStatus: string;
    RequiredSkill: string;
    created_at: string;
    location: string;
}

// Interface for the payload expected by the Timefold API
interface TimefoldPayload {
    employees: any[]; // Define more specific types if possible
    shifts: any[];    // Define more specific types if possible
}

// Interface for the expected structure of the Timefold API response
// Adjust this based on the actual response structure
interface TimefoldResponse {
    shifts: {
        id: string;
        start: string;
        end: string;
        location: string;
        requiredSkill: string;
        shiftMinutes: number;
        shiftType: string;
        employee: {
            name: string;
            workPercentage: number;
            availableWorkMinutes: number;
            // Add other relevant fields from the employee object
        };
    }[];
    employees: {
        name: string;
        workPercentage: number;
        availableWorkMinutes: number;
    }[];
    score: {
        initScore: number;
        hardScore: number;
        softScore: number;
        feasible: boolean; // New attribute
        solutionInitialized: boolean; // New attribute
        zero: boolean; // New attribute
        // Add other relevant fields from the score object
    };
    solverStatus: "NOT_SOLVING" | "SOLVING_ACTIVE" | string;
}


export class ApiService {
    private static async fetchData(endpoint: string, options: RequestInit = {}) {
        try {
            const response = await fetch(`${API_CONFIG.SUPABASE_URL}${endpoint}`, {
                ...options,
                headers: {
                    ...API_CONFIG.HEADERS,
                    ...options.headers,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Employee related API calls
    static async getEmployees() {
        return this.fetchData('/Employee');
    }

    static async getEmployeeById(id: string) {
        return this.fetchData(`/Employee?EmployeeId=eq.${id}`);
    }

    // Update the createEmployee method to match the database schema
    static async createEmployee(employeeData: {
        Name: string;
        work_percentages: number;
        Availability: string[];
        Skills: string[];
        Preferences: string[];
    }): Promise<Employee> {
        return this.fetchData('/Employee', {
            method: 'POST',
            body: JSON.stringify(employeeData)
        });
    }

    static async updateEmployee(id: string, data: Partial<Employee>) {
        return this.fetchData(`/Employee?EmployeeId=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    static async deleteEmployee(id: string) {
        return this.fetchData(`/Employee?Name=eq.${id}`, {
            method: 'DELETE',
        });
    }

    // Employee Role related API calls
    static async getEmployeeRoleById(id: string) {
        return this.fetchData(`${API_CONFIG.ENDPOINTS.EMPLOYEE_ROLE}?EmployeeRoleId=eq.${id}`);
    }

    // Shift related API calls
    static async getShifts() {
        return this.fetchData('/Shift');
    }

    static async getShiftById(id: string) {
        return this.fetchData(`/Shift?ShiftID=eq.${id}`);
    }

    static async createShift(data: Omit<Shift, 'ShiftID' | 'created_at'>) {
        return this.fetchData('/Shift', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    static async updateShift(id: string, data: Partial<Shift>) {
        return this.fetchData(`/Shift?ShiftID=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    static async deleteShift(id: string) {
        return this.fetchData(`/Shift?ShiftID=eq.${id}`, {
            method: 'DELETE',
        });
    }

    /**
     * Sends employee and shift data to the Timefold solver API to initiate solving.
     * @param selectedEmployees - Array of employee objects matching the Employee interface.
     * @param selectedShifts - Array of shift objects.
     * @returns The schedule ID string returned by the Timefold API upon successful initiation.
     */
    static async solveSchedule(selectedEmployees: Employee[], selectedShifts: Shift[]): Promise<string> { // Changed return type
        console.log('ApiService: Preparing data for Timefold initiation...');
        console.log('ApiService: Received Employees:', selectedEmployees); // Log received employees
        console.log('ApiService: Received Shifts:', selectedShifts);     // Log received shifts

        // Helper function to safely parse JSON strings
        const safeJsonParse = (jsonString: string | null | undefined, defaultValue: any[] = []): any[] => {
            if (!jsonString) return defaultValue;
            try {
                const parsed = JSON.parse(jsonString);
                // Ensure it's an array, otherwise return default
                return Array.isArray(parsed) ? parsed : defaultValue;
            } catch (e) {
                console.warn('ApiService: Failed to parse JSON string:', jsonString, e);
                // If parsing fails but it's a non-empty string, maybe treat it as a single-element array?
                // Or stick to the default empty array. Let's stick to default for now.
                return defaultValue;
            }
        };

        // 1. Format Employees data using the correct Employee interface properties
        const formattedEmployees = selectedEmployees.map((emp: Employee) => {
            // Parse JSON string fields safely
            const skills = safeJsonParse(emp.Skills);
            const preferences = safeJsonParse(emp.Preferences);
            const availability = safeJsonParse(emp.Availability); // Assuming Availability means unavailable dates/times

            // You might need to further process 'availability' if it contains days/times instead of specific dates
            // For now, let's assume it maps directly to unavailableDates for the solver
            const unavailableDates = availability;
            // to add in the map just do desiredDates: unavailableDates
            // Map to the structure expected by Timefold
            return {
                name: emp.Name, // Use Name property
                skills: emp.Skills, // Use parsed Skills
                unavailableDates: [], // Use parsed Availability (adjust logic if needed)
                undesiredDates: [], // Add logic if you have undesired dates elsewhere
                desiredDates: [],   // Add logic if you have desired dates elsewhere
                shiftPreferences: emp.Preferences, // Use parsed Preferences
                workPercentage: emp.work_percentages// Use work_percentages
            };
        });

        // 2. Format Shifts data (This part seemed correct based on your log)
        const formattedShifts = selectedShifts.map((shift: Shift) => ({
            id: shift.ShiftID,
            start: shift.StartTime,
            end: shift.EndTime,
            location: shift.location,
            requiredSkill: shift.RequiredSkill
        }));

        // 3. Construct the payload
        const payload: TimefoldPayload = {
            employees: formattedEmployees,
            shifts: formattedShifts
        };

        console.log('ApiService: Sending payload to Timefold:', JSON.stringify(payload, null, 2));

        try {
            const response = await fetch(API_CONFIG.TIMEFOLD_URL, { // This points to '/timefold-api/schedules'
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            // Get the raw response text which should be the ID
            const responseText = await response.text();
            console.log('ApiService: Raw Timefold API Initiation Response Text (Schedule ID):', responseText);

            if (!response.ok) {
                console.error('ApiService: Timefold API Initiation Error Response Text:', responseText);
                // Attempt to parse as JSON only if it looks like JSON, otherwise use text
                let errorDetails = responseText;
                try {
                    const errorJson = JSON.parse(responseText);
                    errorDetails = errorJson.detail || JSON.stringify(errorJson); // Try to get a detail field if it exists
                } catch (e) {
                    // Ignore parsing error, use raw text
                }
                throw new Error(`Timefold API initiation failed: ${response.status} ${response.statusText}. Details: ${errorDetails}`);
            }

            // Assuming the response text is the schedule ID
            const scheduleId = responseText.trim(); // Trim whitespace just in case
            if (!scheduleId) {
                throw new Error('Timefold API returned an empty ID.');
            }
            console.log('ApiService: Received Schedule ID:', scheduleId);
            return scheduleId; // Return the ID string

        } catch (error) {
            console.error('ApiService: Error initiating Timefold solve:', error);
            // Re-throw the error to be caught by the calling component
            throw error;
        }
    }

    /**
     * Fetches the schedule results from the Timefold API using the schedule ID.
     * @param scheduleId - The ID obtained from the solveSchedule POST request.
     * @returns The parsed JSON response (schedule assignments) from the Timefold API.
     */
    static async getScheduleResult(scheduleId: string): Promise<TimefoldResponse> {
        console.log(`ApiService: Fetching schedule result for ID: ${scheduleId}`);
        // Construct the URL for the GET request using the proxy path and the ID
        const scheduleResultUrl = `${API_CONFIG.TIMEFOLD_URL}/${scheduleId}`; // e.g., /timefold-api/schedules/some-id

        try {
            const response = await fetch(scheduleResultUrl, {
                method: 'GET',
                headers: {
                    // Add any necessary headers for the GET request, if different
                    // Often, only 'Accept': 'application/json' might be needed, but fetch usually handles this
                }
            });

            // Log raw text first for debugging
            const responseText = await response.text();

            if (!response.ok) {
                 console.error('ApiService: Timefold API Get Result Error Response Text:', responseText);
                 let errorDetails = responseText;
                 try {
                     const errorJson = JSON.parse(responseText);
                     errorDetails = errorJson.detail || JSON.stringify(errorJson);
                 } catch (e) { /* Use raw text */ }
                throw new Error(`Timefold API GET request failed: ${response.status} ${response.statusText}. Details: ${errorDetails}`);
            }

            // Parse the JSON response which contains the actual schedule
            const result: TimefoldResponse = JSON.parse(responseText);
            console.log('ApiService: Timefold API Get Result Success Response (Parsed):', result);
            return result;

        } catch (error) {
            console.error(`ApiService: Error fetching or parsing Timefold schedule result for ID ${scheduleId}:`, error);
            throw error; // Re-throw
        }
    }
}