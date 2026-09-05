import { getDermatologistProfile } from "@/lib/actions/profile";
import DermatologistProfileForm from "@/components/dermatologist/profile-form";

export default async function DermatologistProfilePage() {
  const { profile } = await getDermatologistProfile();

  return <DermatologistProfileForm initialProfile={profile} />;
}