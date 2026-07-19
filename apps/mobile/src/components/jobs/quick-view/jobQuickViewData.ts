import {
  fetchJobDetails,
  fetchOwnWorkerProfile,
  listWorkerApplications,
  type JobDetails,
  type WorkerApplication,
  type WorkerProfile,
} from "@/services/worker/workerService";

export type JobApplicationContext = {
  applications: WorkerApplication[];
  profile: WorkerProfile | null;
};

const jobDetailsCache = new Map<string, JobDetails | null>();
const jobDetailsRequests = new Map<string, Promise<JobDetails | null>>();
const applicationContextCache = new Map<string, JobApplicationContext>();
const applicationContextRequests = new Map<
  string,
  Promise<JobApplicationContext>
>();
const locallyAppliedJobIds = new Map<string, Set<string>>();

export function readCachedJobDetails(jobId: string) {
  return jobDetailsCache.get(jobId);
}

export async function fetchCachedJobDetails(jobId: string, force = false) {
  if (force) {
    jobDetailsCache.delete(jobId);
    jobDetailsRequests.delete(jobId);
  }

  if (jobDetailsCache.has(jobId)) {
    return jobDetailsCache.get(jobId) ?? null;
  }

  const activeRequest = jobDetailsRequests.get(jobId);

  if (activeRequest) {
    return activeRequest;
  }

  const request = fetchJobDetails(jobId)
    .then((details) => {
      jobDetailsCache.set(jobId, details);
      return details;
    })
    .finally(() => {
      jobDetailsRequests.delete(jobId);
    });

  jobDetailsRequests.set(jobId, request);
  return request;
}

export function readCachedApplicationContext(userId: string) {
  return applicationContextCache.get(userId);
}

export function invalidateCachedApplicationContext(userId: string) {
  applicationContextCache.delete(userId);
  applicationContextRequests.delete(userId);
}

export async function fetchCachedApplicationContext(
  userId: string,
  force = false
) {
  if (force) {
    applicationContextCache.delete(userId);
    applicationContextRequests.delete(userId);
  }

  const cachedContext = applicationContextCache.get(userId);

  if (cachedContext) {
    return cachedContext;
  }

  const activeRequest = applicationContextRequests.get(userId);

  if (activeRequest) {
    return activeRequest;
  }

  const request = Promise.all([
    fetchOwnWorkerProfile(userId),
    listWorkerApplications(),
  ])
    .then(([profile, applications]) => {
      const context = { applications, profile };
      applicationContextCache.set(userId, context);
      return context;
    })
    .finally(() => {
      applicationContextRequests.delete(userId);
    });

  applicationContextRequests.set(userId, request);
  return request;
}

export function hasAppliedToJob(
  userId: string,
  jobId: string,
  applications: WorkerApplication[]
) {
  return (
    locallyAppliedJobIds.get(userId)?.has(jobId) === true ||
    applications.some((application) => application.job_id === jobId)
  );
}

export function markJobAppliedLocally(userId: string, jobId: string) {
  const jobIds = locallyAppliedJobIds.get(userId) ?? new Set<string>();
  jobIds.add(jobId);
  locallyAppliedJobIds.set(userId, jobIds);
}
