import { calculateProfileCompletion } from "./calculateProfileCompletion";
import type { BusinessProfile, StudentProfile, WorkerProfile } from "./types";

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
  companyName: "RabAI Logistics GmbH",
  industry: "profile.industry.logistics",
  location: "Augsburg",
  contactPerson: {
    firstName: "Anna",
    lastName: "Weber",
    email: "anna.weber@rabai-logistics.example",
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

const studentProfileBase: Omit<StudentProfile, "profileCompletion"> = {
  id: "student-demo-1",
  role: "student",
  firstName: "Ana Maria",
  lastName: "Popescu",
  location: "studentProfile.data.location",
  email: "ana.popescu@student.example",
  phone: "+40 744 123 456",
  studentId: "RAB-24-556789",
  education: {
    institution: "studentProfile.data.education.institution",
    faculty: "studentProfile.data.education.faculty",
    period: "studentProfile.data.education.period",
    yearLevel: "studentProfile.data.education.yearLevel",
    gradeAverage: "9.45",
    attendanceType: "studentProfile.data.education.attendanceType",
  },
  studyField: "studentProfile.data.studyField",
  university: "studentProfile.data.education.institution",
  skills: [
    "studentProfile.data.skill.python",
    "studentProfile.data.skill.java",
    "studentProfile.data.skill.javascript",
    "studentProfile.data.skill.cpp",
    "studentProfile.data.skill.sql",
    "studentProfile.data.skill.git",
    "studentProfile.data.skill.html",
    "studentProfile.data.skill.css",
    "studentProfile.data.skill.machineLearning",
  ],
  courses: [
    {
      title: "studentProfile.data.course.machineLearning",
      progress: 90,
    },
    {
      title: "studentProfile.data.course.algorithms",
      progress: 75,
    },
    {
      title: "studentProfile.data.course.webDevelopment",
      progress: 60,
    },
  ],
  projects: [
    {
      title: "studentProfile.data.project.chatbot.title",
      description: "studentProfile.data.project.chatbot.description",
    },
  ],
  goals: [
    {
      title: "studentProfile.data.goal.internship",
      progress: 90,
    },
    {
      title: "studentProfile.data.goal.machineLearning",
      progress: 60,
    },
    {
      title: "studentProfile.data.goal.portfolio",
      progress: 75,
    },
  ],
  internshipPreferences: {
    roles: [
      "studentProfile.data.target.softwareIntern",
      "studentProfile.data.target.aiIntern",
    ],
    industries: [
      "studentProfile.data.industry.software",
      "studentProfile.data.industry.ai",
    ],
    locationPreference: "studentProfile.data.internship.locationPreference",
    workMode: "studentProfile.data.internship.workMode",
  },
  documentsStatus: [
    {
      title: "studentProfile.data.document.cv",
      status: "studentProfile.data.document.cvStatus",
      state: "updated",
    },
    {
      title: "studentProfile.data.document.studentCertificate",
      status: "studentProfile.data.document.studentCertificateStatus",
      state: "valid",
    },
    {
      title: "studentProfile.data.document.english",
      status: "studentProfile.data.document.englishStatus",
      state: "verified",
    },
    {
      title: "studentProfile.data.document.portfolio",
      status: "studentProfile.data.document.portfolioStatus",
      state: "verified",
    },
  ],
  availability: {
    seekingInternship: true,
    partTime: true,
    openToRelocate: true,
    weeklyHours: 20,
  },
  careerIntent: {
    summary: "studentProfile.data.about",
    targetRoles: [
      "studentProfile.data.target.softwareIntern",
      "studentProfile.data.target.aiIntern",
    ],
    preferredIndustries: [],
  },
  upgradeOptions: ["worker", "freelancer", "business"],
};

export const mockWorkerProfile: WorkerProfile = {
  ...workerProfileBase,
  profileCompletion: calculateProfileCompletion(workerProfileBase),
};

export const mockBusinessProfile: BusinessProfile = {
  ...businessProfileBase,
  profileCompletion: calculateProfileCompletion(businessProfileBase),
};

export const mockStudentProfile: StudentProfile = {
  ...studentProfileBase,
  profileCompletion: calculateProfileCompletion(studentProfileBase),
};
