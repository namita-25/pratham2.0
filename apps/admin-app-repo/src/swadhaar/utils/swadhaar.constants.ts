export enum SwadhaarRole {
  ADMIN = 'admin',
  CFL_INCHARGE = 'CFL Incharge',
  TRAINER = 'Trainer',
  SUPERVISOR = 'Supervisor',
  STAFF = 'Staff',
  CONTENT_CREATOR = 'Content creator',
  CONTENT_REVIEWER = 'Content reviewer',
}

export const SWADHAAR_THEME = {
  primary: '#1A237E',      // Dark Navy Blue
  secondary: '#FF8F00',    // Swadhaar Amber Gold
  background: '#F3F5F8',   // Light Grey
  paper: '#FFFFFF',        // Solid White
  textPrimary: '#1F1B13',
  textSecondary: '#7C766F',
  success: '#1A8825',
  error: '#BA1A1A',
};

export const SWADHAAR_CONSTANTS = {
  MOBILE_REGEX: /^\+91[6-9]\d{9}$/,
  MOBILE_PLACEHOLDER: '+91XXXXXXXXXX',
  TENANT_ID: '35529b5d-526f-4da5-bc6e-64f740023d26', // Swadhaar tenant ID in local storage
};

export enum StorageKeys {
  TOKEN = 'token',
  REFRESH_TOKEN = 'refreshToken',
  USER_ID = 'userId',
  USER_DATA = 'userData',
  ADMIN_INFO = 'adminInfo',
  ROLE_ID = 'roleId',
  ROLE_NAME = 'roleName',
  PROGRAM = 'program',
  TENANT_ID = 'tenantId',
  ACADEMIC_YEAR_ID = 'academicYearId',
}
