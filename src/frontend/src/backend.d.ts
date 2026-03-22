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

export interface ReformItem {
    id: string;
    title: string;
    summary: string;
    category: string;
    status: string;
    evidenceNote: string;
    petitionCount: bigint;
    submittedBy: string;
    submittedAt: bigint;
}

export interface ArchiveEntry {
    id: string;
    caseTitle: string;
    state: string;
    lga: string;
    category: string;
    description: string;
    source: string;
    incidentDate: string;
    submittedBy: string;
    submittedAt: bigint;
}

export interface PublicStats {
    totalReports: bigint;
    byCategory: [string, bigint][];
}

export interface backendInterface {
    initializeUser(): Promise<void>;
    submitReport(category: string, description: string, gpsLat: number, gpsLon: number, clientTimestamp: string, deviceId: string, mediaKeys: string[], anonymous: boolean, signatureData: string): Promise<string>;
    getReportCount(): Promise<bigint>;
    getReports(): Promise<Report[]>;
    getReport(id: string): Promise<[] | [Report]>;
    isCallerAdmin(): Promise<boolean>;
    getCallerUserRole(): Promise<UserRole>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    // Reform Lobby
    submitReformItem(title: string, summary: string, category: string, evidenceNote: string, submittedBy: string): Promise<string>;
    signPetition(id: string): Promise<boolean>;
    getReformItems(): Promise<ReformItem[]>;
    updateReformItemStatus(id: string, status: string): Promise<boolean>;
    // Disenfranchisement Archive
    submitArchiveEntry(caseTitle: string, state: string, lga: string, category: string, description: string, source: string, incidentDate: string, submittedBy: string): Promise<string>;
    getArchiveEntries(): Promise<ArchiveEntry[]>;
    getPublicStats(): Promise<PublicStats>;
}
