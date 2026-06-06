import AuthModal from "@/components/auth/AuthModal";
import { HomePageContent } from "@/components/home/HomePageContent";

export default function RegisterPage() {
  return (
    <>
      <HomePageContent />
      <AuthModal mode="register" />
    </>
  );
}
