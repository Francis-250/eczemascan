export function isDoctorRole(role: string | null | undefined) {
  return role === "DERMATOLOGIST";
}

export function isPatientProfileComplete(profile: { dateOfBirth: Date | null; sex: string | null } | null | undefined) {
  return !!profile?.dateOfBirth && profile.dateOfBirth <= new Date() && !!profile.sex?.trim();
}
