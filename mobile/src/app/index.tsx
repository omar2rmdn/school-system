import { useAuthStore } from "@/store";
import { Href, Redirect } from "expo-router";

export default function Index() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const session = useAuthStore((state) => state.session);

  if (!isHydrated) {
    return null;
  }

  if (!session?.accessToken) {
    return <Redirect href="/login" />;
  }

  return <Redirect href={`/(main)/${session.user.role}/(tabs)/home` as Href} />;
}
