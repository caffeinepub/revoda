import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;

export type UserRole = { admin: null } | { user: null } | { guest: null };

export interface Report {
    id: string;
    category: string;
    description: string;
    gpsLat: number;
    gpsLon: number;
    clientTimestamp: string;
    deviceId: string;
    mediaKeys: string[];
    anonymous: boolean;
    signatureData: string;
    submittedAt: bigint;
}

export interface backendInterface {
    submitReport(category: string, description: string, gpsLat: number, gpsLon: number, clientTimestamp: string, deviceId: string, mediaKeys: string[], anonymous: boolean, signatureData: string): Promise<string>;
    getReportCount(): Promise<bigint>;
    getReports(): Promise<Report[]>;
    getReport(id: string): Promise<[] | [Report]>;
    isCallerAdmin(): Promise<boolean>;
    getCallerUserRole(): Promise<UserRole>;
    _initializeAccessControlWithSecret(userSecret: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
}
