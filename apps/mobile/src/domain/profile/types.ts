export type ProfileRole = "worker" | "business" | "student" | "freelancer";

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

export type StudentEducation = {
  institution: string;
  faculty: string;
  period: string;
  yearLevel: string;
  gradeAverage: string;
  attendanceType: string;
};

export type StudentCourse = {
  title: string;
  progress: number;
};

export type StudentProject = {
  title: string;
  description: string;
};

export type StudentGoal = {
  title: string;
  progress: number;
};

export type StudentDocumentState =
  | "updated"
  | "valid"
  | "verified"
  | "needsAction";

export type StudentDocumentStatus = {
  title: string;
  status: string;
  state: StudentDocumentState;
};

export type StudentAvailability = {
  seekingInternship: boolean;
  partTime: boolean;
  openToRelocate: boolean;
  weeklyHours: number;
};

export type StudentCareerIntent = {
  summary: string;
  targetRoles: string[];
  preferredIndustries: string[];
};

export type StudentInternshipPreferences = {
  roles: string[];
  industries: string[];
  locationPreference: string;
  workMode: string;
};

export type StudentUpgradeOption = "worker" | "freelancer" | "business";

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

export type StudentProfile = {
  id: string;
  role: "student";
  firstName: string;
  lastName: string;
  location: string;
  email: string;
  phone: string;
  studentId: string;
  education: StudentEducation;
  studyField: string;
  university: string;
  skills: string[];
  courses: StudentCourse[];
  projects: StudentProject[];
  goals: StudentGoal[];
  internshipPreferences: StudentInternshipPreferences;
  documentsStatus: StudentDocumentStatus[];
  availability: StudentAvailability;
  careerIntent: StudentCareerIntent;
  profileCompletion: number;
  upgradeOptions: StudentUpgradeOption[];
};

export type Profile = WorkerProfile | BusinessProfile | StudentProfile;
