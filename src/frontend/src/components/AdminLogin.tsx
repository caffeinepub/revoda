import { AlertCircle, Loader2, Shield } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { AppView } from "../App";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";
import { Header } from "./Header";

interface AdminLoginProps {
  navigate: (v: AppView) => void;
}

export function AdminLogin({ navigate }: AdminLoginProps) {
  const { login, clear, identity, isLoggingIn, isInitializing, loginStatus } =
    useInternetIdentity();
  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  const adminQuery = useIsAdmin();
  const isAdmin = adminQuery.data === true;
  const isCheckingAdmin = adminQuery.isLoading;

  const [hasChecked, setHasChecked] = useState(false);

  const handleLogin = () => {
    login();
    setHasChecked(true);
  };

  // If logged in and confirmed admin, redirect
  if (isLoggedIn && isAdmin && !isCheckingAdmin) {
    navigate("admin-dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-section-bg">
      <Header navigate={navigate} currentView="admin-login" />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl border border-border shadow-card w-full max-w-md p-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-brand-red" />
            </div>
            <h1 className="text-2xl font-black text-foreground">
              Admin Access
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              Sign in with Internet Identity to access the Revoda Admin
              Dashboard.
            </p>
          </div>

          {/* Not logged in */}
          {!isLoggedIn && (
            <div className="space-y-4">
              <button
                type="button"
                data-ocid="admin_login.primary_button"
                onClick={handleLogin}
                disabled={isLoggingIn || isInitializing}
                className="w-full flex items-center justify-center gap-3 bg-brand-red hover:bg-brand-red-dark text-white font-bold py-3.5 rounded-xl shadow-cta transition-all hover:scale-[1.01] disabled:opacity-60"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Connecting...
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5" /> Sign in with Internet
                    Identity
                  </>
                )}
              </button>
              <p className="text-center text-xs text-muted-foreground">
                Secure, decentralized authentication — no password required.
              </p>
            </div>
          )}

          {/* Logged in, checking admin */}
          {isLoggedIn && isCheckingAdmin && (
            <div
              data-ocid="admin_login.loading_state"
              className="flex flex-col items-center gap-3 py-6"
            >
              <Loader2 className="w-8 h-8 animate-spin text-brand-red" />
              <p className="text-sm text-muted-foreground">
                Verifying admin access...
              </p>
            </div>
          )}

          {/* Logged in, NOT admin */}
          {isLoggedIn && !isCheckingAdmin && !isAdmin && hasChecked && (
            <div data-ocid="admin_login.error_state" className="space-y-4">
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                <AlertCircle className="w-5 h-5 text-brand-red shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-brand-red text-sm">
                    Access Denied
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your account does not have admin privileges. Contact EiE
                    Nigeria if you believe this is an error.
                  </p>
                </div>
              </div>
              <button
                type="button"
                data-ocid="admin_login.secondary_button"
                onClick={() => clear()}
                className="w-full border border-border text-foreground font-medium py-2.5 rounded-xl hover:bg-section-bg transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}

          {loginStatus === "loginError" && (
            <div
              data-ocid="admin_login.error_state"
              className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200"
            >
              <p className="text-sm text-brand-red">
                Login failed. Please try again.
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-border">
            <button
              type="button"
              data-ocid="admin_login.cancel_button"
              onClick={() => navigate("landing")}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
