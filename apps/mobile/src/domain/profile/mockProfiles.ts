import { calculateProfileCompletion } from "./calculateProfileCompletion";
import type { BusinessProfile, WorkerProfile } from "./types";

const workerProfileBase: Omit<WorkerProfile, "profileCompletion"> = {
  id: "worker-demo-1",
  role: "worker",
  firstName: "Ion",
  lastName: "Popescu",
  location: "Augsburg",
  preferredLanguages: ["profile.language.ro", "profile.language.de"],
  workPreferences: [
    "profile.workPreference.warehouse",
    "profile.workPreference.cleaning",
  ],
  skills: [
    "profile.skill.warehouse",
    "profile.skill.inventory",
    "profile.skill.cleaning",
  ],
  experience: [
    {
      title: "profile.experience.warehouseAssistant",
      years: 2,
    },
  ],
  certifications: ["profile.certification.safetyBasics"],
  availability: {
    label: "profile.availability.weekendsEvenings",
    weeklyHours: 24,
    startDate: "profile.availability.immediate",
  },
  documentsStatus: {
    identity: "verified",
    workEligibility: "pending",
    taxInformation: "missing",
  },
};

const businessProfileBase: Omit<BusinessProfile, "profileCompletion"> = {
  id: "business-demo-1",
  role: "business",
  companyName: "WAP Logistics GmbH",
  industry: "profile.industry.logistics",
  location: "Augsburg",
  contactPerson: {
    firstName: "Anna",
    lastName: "Weber",
    email: "anna.weber@wap-logistics.example",
  },
  hiringNeeds: {
    roles: [
      "profile.hiringNeed.warehouseWorkers",
      "profile.hiringNeed.cleaningStaff",
    ],
    estimatedWorkers: 6,
    startDate: "profile.hiringNeed.immediate",
    employmentType: "profile.employment.shortTerm",
  },
  verificationStatus: "pending",
};

export const mockWorkerProfile: WorkerProfile = {
  ...workerProfileBase,
  profileCompletion: calculateProfileCompletion(workerProfileBase),
};

export const mockBusinessProfile: BusinessProfile = {
  ...businessProfileBase,
  profileCompletion: calculateProfileCompletion(businessProfileBase),
};
