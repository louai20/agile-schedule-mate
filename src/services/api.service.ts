import { API_CONFIG } from '../config/api.config';

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

    static async createEmployee(employeeData: {
        Name: string;
        work_percentages: number;
        Availability: string;
        employeeRoleId: string;
        Skills: string;
        Preferences: string;
    }): Promise<Employee> {
        return this.fetchData('/Employee', {
            method: 'POST',
            body: JSON.stringify(employeeData),
        });
    }

    static async updateEmployee(id: string, data: Partial<Employee>) {
        return this.fetchData(`/Employee?EmployeeId=eq.${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    static async deleteEmployee(id: string) {
        return this.fetchData(`/Employee?EmployeeId=eq.${id}`, {
            method: 'DELETE',
        });
    }

    // Employee Role related API calls
    static async getEmployeeRoleById(id: string) {
        return this.fetchData(`${API_CONFIG.ENDPOINTS.EMPLOYEE_ROLE}?EmployeeRoleId=eq.${id}`);
    }

    static async getEmployeeRoles() {
        return this.fetchData(API_CONFIG.ENDPOINTS.EMPLOYEE_ROLE);
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
}