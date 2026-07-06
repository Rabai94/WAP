export type ProfileRole = "worker" | "business";

export type ProfileStatus = "missing" | "pending" | "verified";

export type BusinessVerificationStatus = "unverified" | "pending" | "verified";

export type WorkerExperience = {
  title: string;
  years: number;
};

export type WorkerAvailability = {
  label: string;
  weeklyHours: number;
  startDate: string;
};

export type WorkerDocumentsStatus = {
  identity: ProfileStatus;
  workEligibility: ProfileStatus;
  taxInformation: ProfileStatus;
};

export type BusinessContactPerson = {
  firstName: string;
  lastName: string;
  email: string;
};

export type BusinessHiringNeeds = {
  roles: string[];
  estimatedWorkers: number;
  startDate: string;
  employmentType: string;
};

export type WorkerProfile = {
  id: string;
  role: "worker";
  firstName: string;
  lastName: string;
  location: string;
  preferredLanguages: string[];
  workPreferences: string[];
  skills: string[];
  experience: WorkerExperience[];
  certifications: string[];
  availability: WorkerAvailability;
  documentsStatus: WorkerDocumentsStatus;
  profileCompletion: number;
};

export type BusinessProfile = {
  id: string;
  role: "business";
  companyName: string;
  industry: string;
  location: string;
  contactPerson: BusinessContactPerson;
  hiringNeeds: BusinessHiringNeeds;
  verificationStatus: BusinessVerificationStatus;
  profileCompletion: number;
};

export type Profile = WorkerProfile | BusinessProfile;
