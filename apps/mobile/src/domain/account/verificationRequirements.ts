import type {
  VerificationActionKey,
  VerificationActionRequirement,
  VerificationLevel,
  VerificationRequirement,
} from "./types";

const actionRequirements: VerificationActionRequirement[] = [
  {
    actionKey: "apply_basic_job",
    titleKey: "verification.action.applyBasicJob.title",
    descriptionKey: "verification.action.applyBasicJob.text",
    requiredLevels: [1],
    requirements: [
      requirement("identity_for_job", 1, "apply_basic_job"),
    ],
  },
  {
    actionKey: "apply_basic_task",
    titleKey: "verification.action.applyBasicTask.title",
    descriptionKey: "verification.action.applyBasicTask.text",
    requiredLevels: [1],
    requirements: [
      requirement("identity_for_task", 1, "apply_basic_task"),
    ],
  },
  {
    actionKey: "offer_professional_service",
    titleKey: "verification.action.offerProfessionalService.title",
    descriptionKey: "verification.action.offerProfessionalService.text",
    requiredLevels: [1, 2],
    requirements: [
      requirement("identity_for_service", 1, "offer_professional_service"),
      requirement("profile_for_service", 2, "offer_professional_service"),
    ],
  },
  {
    actionKey: "offer_regulated_service",
    titleKey: "verification.action.offerRegulatedService.title",
    descriptionKey: "verification.action.offerRegulatedService.text",
    requiredLevels: [1, 2, 3, 4],
    requirements: [
      requirement("identity_for_regulated", 1, "offer_regulated_service"),
      requirement("profile_for_regulated", 2, "offer_regulated_service"),
      requirement("qualification_for_regulated", 3, "offer_regulated_service"),
      requirement("authorization_for_regulated", 4, "offer_regulated_service"),
    ],
  },
  {
    actionKey: "enroll_course",
    titleKey: "verification.action.enrollCourse.title",
    descriptionKey: "verification.action.enrollCourse.text",
    requiredLevels: [0],
    requirements: [
      requirement("basic_account_for_course", 0, "enroll_course", "verified"),
    ],
  },
  {
    actionKey: "publish_job",
    titleKey: "verification.action.publishJob.title",
    descriptionKey: "verification.action.publishJob.text",
    requiredLevels: [1],
    requirements: [
      requirement("organization_for_job", 1, "publish_job"),
    ],
  },
];

export function getVerificationActions() {
  return actionRequirements;
}

export function getVerificationRequirementsForAction(
  actionKey: VerificationActionKey
) {
  return actionRequirements.find((item) => item.actionKey === actionKey) ?? null;
}

function requirement(
  id: string,
  level: VerificationLevel,
  actionKey: VerificationActionKey,
  status: VerificationRequirement["status"] = "required_for_action"
): VerificationRequirement {
  return {
    actionKey,
    descriptionKey: `verification.requirement.${id}.text`,
    id,
    level,
    status,
    titleKey: `verification.requirement.${id}.title`,
  };
}
