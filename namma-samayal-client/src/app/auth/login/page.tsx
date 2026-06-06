import AuthModal from "@/components/auth/AuthModal";
import { HomePageContent } from "@/components/home/HomePageContent";

export default function LoginPage() {
  return (
    <>
      <HomePageContent />
      <AuthModal mode="login" />
    </>
  );
}
