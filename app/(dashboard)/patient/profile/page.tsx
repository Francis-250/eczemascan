import { getPatientProfile } from "@/lib/actions/profile";
import PatientProfileForm from "@/components/patient/profile-form";

export default async function ProfilePage() {
  const { profile } = await getPatientProfile();

  return <PatientProfileForm initialProfile={profile} />;
}