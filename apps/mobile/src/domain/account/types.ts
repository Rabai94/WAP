export type AccountType = "personal";

export type LegacyAccountType = AccountType | "organization";

export type OnboardingIntent = "personal" | "create_organization";

export type OrganizationType = "company" | "academy" | "institution";

export type PersonalInterest =
  | "find_jobs"
  | "find_tasks"
  | "offer_services"
  | "request_service"
  | "find_courses"
  | "explore_only";

export type VerificationLevel = 0 | 1 | 2 | 3 | 4;

export type VerificationStatus =
  | "not_started"
  | "pending"
  | "verified"
  | "required_for_action";

export type VerificationActionKey =
  | "apply_basic_job"
  | "apply_basic_task"
  | "offer_professional_service"
  | "offer_regulated_service"
  | "enroll_course"
  | "publish_job";

export type VerificationRequirement = {
  id: string;
  level: VerificationLevel;
  status: VerificationStatus;
  actionKey?: VerificationActionKey;
  titleKey: string;
  descriptionKey: string;
};

export type VerificationActionRequirement = {
  actionKey: VerificationActionKey;
  titleKey: string;
  descriptionKey: string;
  requiredLevels: VerificationLevel[];
  requirements: VerificationRequirement[];
};

export type ProfileCapability =
  | "apply_to_jobs"
  | "apply_to_tasks"
  | "offer_services"
  | "request_services"
  | "enroll_in_courses"
  | "manage_organizations"
  | "publish_jobs"
  | "publish_courses";

export type AccountCompatibilityProfile = {
  accountType: AccountType;
  capabilities: ProfileCapability[];
  interests: PersonalInterest[];
  managedOrganizationTypes: OrganizationType[];
  verificationLevel: VerificationLevel;
};

export type ContentType = "job" | "task" | "service" | "course";

export type ContentOwnerType = "personal_account" | "organization";

export type ContentLifecycleStatus =
  | "draft"
  | "published"
  | "paused"
  | "expired"
  | "archived";

export type BaseContentModel = {
  id: string;
  type: ContentType;
  ownerId: string;
  ownerType: ContentOwnerType;
  status: ContentLifecycleStatus;
  title: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
};

export type JobContentModel = BaseContentModel & {
  type: "job";
  ownerType: "organization";
  organizationType: "company";
  employmentType?: string;
};

export type TaskContentModel = BaseContentModel & {
  type: "task";
  ownerType: ContentOwnerType;
  budgetAmount?: number | null;
  budgetCurrency?: string | null;
};

export type ServiceContentModel = BaseContentModel & {
  type: "service";
  ownerType: ContentOwnerType;
  verificationRequiredLevel: VerificationLevel;
};

export type CourseContentModel = BaseContentModel & {
  type: "course";
  ownerType: "organization";
  organizationType: "academy" | "company";
};

export type RabaiContentModel =
  | JobContentModel
  | TaskContentModel
  | ServiceContentModel
  | CourseContentModel;

export type OrganizationMembershipRole = "owner" | "admin" | "member";

export type OrganizationMembership = {
  organizationId: string;
  userId: string;
  role: OrganizationMembershipRole;
  status: "active" | "invited" | "suspended";
};
