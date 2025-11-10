import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { logout } from "../auth/auth.slice";
import { useNavigate } from "react-router-dom";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.authState);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  console.log({ user });

  if (!user) {
    return null;
  }

  const displayName =
    user.firstname && user.lastname
      ? `${user.firstname} ${user.lastname}`
      : user.email;
  console.log({ displayName });

  const profileStatusLabel =
    user.profileStatus === "completed" ? "Complet" : "Incomplet";

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Bonjour {displayName}</h1>
          <Button onClick={handleLogout} variant="outline">
            Se déconnecter
          </Button>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">Informations personnelles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Prénom:</span>
                <span>{user.firstname || "Non renseigné"}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Nom:</span>
                <span>{user.lastname || "Non renseigné"}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Email:</span>
                <span>{user.email}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="font-medium">Statut du profil:</span>
                <span>{profileStatusLabel}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
