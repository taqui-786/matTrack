import { DashboardCircleIcon, Login, LogoutIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { supabaseClient } from '@/lib/supabase/supabaseClient'
import { toast } from 'sonner'

function Navbar() {
    const [session, setSession] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const handleLogout = async () => {
      try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Logged out successfully");
          navigate("/");
        }
      } catch (err) {
        toast.error("An error occurred during logout");
        console.error(err);
      }
    };

    useEffect(() => {
      supabaseClient.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
      });

      const {
        data: { subscription },
      } = supabaseClient.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    }, []);
  return (
    <header className="fixed top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-90"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
              <HugeiconsIcon
                icon={DashboardCircleIcon}
                size={20}
                strokeWidth={2}
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              MatTrack
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            {!loading && (
              <>
                {session ? (
                  <>
                    <Button variant="secondary" size="lg" onClick={handleLogout}>
                      <HugeiconsIcon
                        icon={LogoutIcon}
                        size={20}
                        className="mr-2"
                      />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button asChild size="lg">
                    <Link to="/sign-in">
                      <HugeiconsIcon icon={Login} size={20} className="mr-2" />
                      Sign In
                    </Link>
                  </Button>
                )}
              </>
            )}
          </nav>
        </div>
      </header>
  )
}

export default Navbar