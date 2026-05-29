import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { isAllowedEduEmail, redirectToDoeLogin } from "@/lib/authPolicy";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({ user: null, session: null, loading: true, isAdmin: false, signOut: async () => {} });

async function enforceEduEmail(s: Session | null): Promise<Session | null> {
  const email = s?.user?.email;
  if (s && email && !isAllowedEduEmail(email)) {
    await supabase.auth.signOut();
    redirectToDoeLogin();
    return null;
  }
  return s;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      enforceEduEmail(s).then(validated => {
        setSession(validated);
        setUser(validated?.user ?? null);
      });
    });
    supabase.auth.getSession().then(({ data }) => {
      enforceEduEmail(data.session).then(validated => {
        setSession(validated);
        setUser(validated?.user ?? null);
        setLoading(false);
      });
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    supabase.from("user_roles").select("role").eq("user_id", user.id).then(({ data }) => {
      setIsAdmin(!!data?.some(r => r.role === "admin"));
    });
  }, [user]);

  const signOut = async () => { await supabase.auth.signOut(); };

  return <Ctx.Provider value={{ user, session, loading, isAdmin, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
