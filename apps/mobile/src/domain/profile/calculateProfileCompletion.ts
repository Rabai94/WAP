import type { BusinessProfile, StudentProfile, WorkerProfile } from "./types";

type CompletionProfile =
  | (Omit<WorkerProfile, "profileCompletion"> & { profileCompletion?: number })
  | (Omit<BusinessProfile, "profileCompletion"> & { profileCompletion?: number })
  | (Omit<StudentProfile, "profileCompletion"> & { profileCompletion?: number });

export function calculateProfileCompletion(profile: CompletionProfile) {
  const checks = getCompletionChecks(profile);

  const completedFields = checks.filter(Boolean).length;

  return Math.round((completedFields / checks.length) * 100);
}

function getCompletionChecks(profile: CompletionProfile) {
  if (profile.role === "worker") {
    return getWorkerCompletionChecks(profile);
  }

  if (profile.role === "business") {
    return getBusinessCompletionChecks(profile);
  }

  return getStudentCompletionChecks(profile);
}

function getWorkerCompletionChecks(
  profile: Omit<WorkerProfile, "profileCompletion"> & {
    profileCompletion?: number;
  }
) {
  return [
    isFilled(profile.firstName),
    isFilled(profile.lastName),
    isFilled(profile.location),
    isFilled(profile.preferredLanguages),
    isFilled(profile.workPreferences),
    isFilled(profile.skills),
    isFilled(profile.experience),
    isFilled(profile.certifications),
    isCompleteAvailability(profile.availability),
    areWorkerDocumentsReady(profile.documentsStatus),
  ];
}

function getBusinessCompletionChecks(
  profile: Omit<BusinessProfile, "profileCompletion"> & {
    profileCompletion?: number;
  }
) {
  return [
    isFilled(profile.companyName),
    isFilled(profile.industry),
    isFilled(profile.location),
    isCompleteContact(profile.contactPerson),
    isCompleteHiringNeeds(profile.hiringNeeds),
    profile.verificationStatus === "verified",
  ];
}

function getStudentCompletionChecks(
  profile: Omit<StudentProfile, "profileCompletion"> & {
    profileCompletion?: number;
  }
) {
  return [
    isFilled(profile.firstName),
    isFilled(profile.lastName),
    isFilled(profile.location),
    isFilled(profile.email),
    isFilled(profile.phone),
    isFilled(profile.studentId),
    isCompleteStudentEducation(profile.education),
    isFilled(profile.studyField),
    isFilled(profile.university),
    profile.skills.length >= 6,
    profile.courses.length >= 3,
    profile.courses.every((course) => course.progress >= 80),
    isFilled(profile.projects),
    profile.goals.length >= 3,
    profile.goals.every((goal) => goal.progress >= 80),
    isCompleteInternshipPreferences(profile.internshipPreferences),
    areStudentDocumentsReady(profile.documentsStatus),
    profile.availability.seekingInternship,
    profile.availability.partTime,
    profile.availability.openToRelocate,
    profile.availability.weeklyHours > 0,
    isFilled(profile.careerIntent.summary),
    profile.upgradeOptions.includes("worker"),
    profile.upgradeOptions.includes("freelancer"),
    profile.upgradeOptions.includes("business"),
    isFilled(profile.careerIntent.preferredIndustries),
  ];
}

function isFilled(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return Boolean(value);
}

function isCompleteAvailability(
  availability: Omit<WorkerProfile, "profileCompletion">["availability"]
) {
  return (
    isFilled(availability.label) &&
    availability.weeklyHours > 0 &&
    isFilled(availability.startDate)
  );
}

function areWorkerDocumentsReady(
  documentsStatus: Omit<WorkerProfile, "profileCompletion">["documentsStatus"]
) {
  return Object.values(documentsStatus).every((status) => status === "verified");
}

function isCompleteContact(
  contactPerson: Omit<BusinessProfile, "profileCompletion">["contactPerson"]
) {
  return (
    isFilled(contactPerson.firstName) &&
    isFilled(contactPerson.lastName) &&
    isFilled(contactPerson.email)
  );
}

function isCompleteHiringNeeds(
  hiringNeeds: Omit<BusinessProfile, "profileCompletion">["hiringNeeds"]
) {
  return (
    isFilled(hiringNeeds.roles) &&
    hiringNeeds.estimatedWorkers > 0 &&
    isFilled(hiringNeeds.startDate) &&
    isFilled(hiringNeeds.employmentType)
  );
}

function isCompleteStudentEducation(
  education: Omit<StudentProfile, "profileCompletion">["education"]
) {
  return (
    isFilled(education.institution) &&
    isFilled(education.faculty) &&
    isFilled(education.period) &&
    isFilled(education.yearLevel) &&
    isFilled(education.gradeAverage) &&
    isFilled(education.attendanceType)
  );
}

function areStudentDocumentsReady(
  documentsStatus: Omit<StudentProfile, "profileCompletion">["documentsStatus"]
) {
  const readyStates = ["updated", "valid", "verified"];

  return (
    documentsStatus.length > 0 &&
    documentsStatus.every((document) => readyStates.includes(document.state))
  );
}

function isCompleteInternshipPreferences(
  preferences: Omit<StudentProfile, "profileCompletion">["internshipPreferences"]
) {
  return (
    isFilled(preferences.roles) &&
    isFilled(preferences.industries) &&
    isFilled(preferences.locationPreference) &&
    isFilled(preferences.workMode)
  );
}
