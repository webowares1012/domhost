
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function SessionTimeout() {
    const router = useRouter();

    const [showPopup, setShowPopup] = useState(false);
    const [checking, setChecking] = useState(true);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        let mounted = true;

        async function checkSession() {
            try {
                const response = await fetch("/api/auth/me", {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                });

                if (response.status === 401 && mounted) {
                    setShowPopup(true);
                }
            } catch (error) {
                console.error("Session check failed:", error);
            } finally {
                if (mounted) {
                    setChecking(false);
                }
            }
        }

        // Check session immediately
        checkSession();

        // Check every 30 seconds
        intervalRef.current = setInterval(checkSession, 30000);

        return () => {
            mounted = false;

            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    function handleSessionExpired() {
        setShowPopup(false);

        // Replace history so Back does not return to dashboard
        router.replace("/login");
    }

    if (checking || !showPopup) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="session-timeout-title"
                aria-describedby="session-timeout-message"
                className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="26"
                        height="26"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-amber-600"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                </div>

                <h2
                    id="session-timeout-title"
                    className="text-xl font-bold text-slate-900"
                >
                    Session Timeout
                </h2>

                <p
                    id="session-timeout-message"
                    className="mt-2 text-sm leading-6 text-slate-600"
                >
                    Your session has expired. Please login again to continue using
                    Domhost.
                </p>

                <button
                    type="button"
                    onClick={handleSessionExpired}
                    className="mt-6 w-full rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                    OK
                </button>
            </div>
        </div>
    );
}