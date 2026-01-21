import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabaseClient";
import { Button } from "./ui/button";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login", { replace: true });
  }

  return (
    <header className="border-b bg-background">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="font-semibold text-lg">Pareeksha</div>

        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>

            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
