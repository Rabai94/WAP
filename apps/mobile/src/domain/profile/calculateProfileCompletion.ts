import type { BusinessProfile, WorkerProfile } from "./types";

type CompletionProfile =
  | (Omit<WorkerProfile, "profileCompletion"> & { profileCompletion?: number })
  | (Omit<BusinessProfile, "profileCompletion"> & { profileCompletion?: number });

export function calculateProfileCompletion(profile: CompletionProfile) {
  const checks =
    profile.role === "worker"
      ? getWorkerCompletionChecks(profile)
      : getBusinessCompletionChecks(profile);

  const completedFields = checks.filter(Boolean).length;

  return Math.round((completedFields / checks.length) * 100);
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
