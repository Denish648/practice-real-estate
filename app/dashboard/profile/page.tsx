import ProfileForm from "@/components/profile-form"
import { getProfile } from "@/lib/data/profile"

export default async function Profile() {
  const { profileData: profile, error: profileError } = await getProfile()
  if (profileError) throw profileError
  if (!profile) throw new Error("Profile not found")
  return (
    <>
      <ProfileForm profile={profile} />
    </>
  )
}
