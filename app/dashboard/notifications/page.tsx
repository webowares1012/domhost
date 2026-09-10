"use client";

import { useState } from "react";
import {
    Bell,
    Check,
    CheckCheck,
    Trash2,
    Globe,
    Server,
    RefreshCcw,
    AlertTriangle,
} from "lucide-react";

type NotificationType = "domain" | "hosting" | "renewal" | "system";

interface Notification {
    id: number;
    title: string;
    message: string;
    type: NotificationType;
    time: string;
    read: boolean;
}

const initialNotifications: Notification[] = [
    {
        id: 1,
        title: "Domain Expiring Soon",
        message: "example.com will expire in 15 days.",
        type: "domain",
        time: "10 minutes ago",
        read: false,
    },
    {
        id: 2,
        title: "Hosting Expiring Soon",
        message: "Your Hostinger hosting for mywebsite.in expires in 7 days.",
        type: "hosting",
        time: "1 hour ago",
        read: false,
    },
    {
        id: 3,
        title: "Renewal Reminder",
        message: "portfolio.com renewal is due soon.",
        type: "renewal",
        time: "Yesterday",
        read: true,
    },
    {
        id: 4,
        title: "Domain Expired",
        message: "oldwebsite.net expired 2 days ago.",
        type: "system",
        time: "2 days ago",
        read: true,
    },
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(
        initialNotifications
    );

    const [filter, setFilter] = useState<"all" | "unread">("all");

    const unreadCount = notifications.filter((n) => !n.read).length;

    const visibleNotifications =
        filter === "unread"
            ? notifications.filter((n) => !n.read)
            : notifications;

    function markAsRead(id: number) {
        setNotifications((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, read: true } : item
            )
        );
    }

    function markAllAsRead() {
        setNotifications((prev) =>
            prev.map((item) => ({ ...item, read: true }))
        );
    }

    function removeNotification(id: number) {
        setNotifications((prev) => prev.filter((item) => item.id !== id));
    }

    return (
        <main className="space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-900">
                            Notifications
                        </h1>

                        {unreadCount > 0 && (
                            <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                                {unreadCount} unread
                            </span>
                        )}
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                        Stay updated with your domains and hosting.
                    </p>
                </div>

                <button
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <CheckCheck size={17} />
                    Mark all as read
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter("all")}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${filter === "all"
                            ? "bg-slate-900 text-white"
                            : "border border-slate-200 bg-white text-slate-600"
                        }`}
                >
                    All
                </button>

                <button
                    onClick={() => setFilter("unread")}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold ${filter === "unread"
                            ? "bg-slate-900 text-white"
                            : "border border-slate-200 bg-white text-slate-600"
                        }`}
                >
                    Unread
                </button>
            </div>

            {/* Notifications */}
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {visibleNotifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <Bell
                            size={44}
                            className="mx-auto text-slate-300"
                        />

                        <h3 className="mt-4 font-semibold text-slate-900">
                            No notifications
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            You are all caught up.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {visibleNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`flex gap-4 p-5 ${!notification.read ? "bg-slate-50" : ""
                                    }`}
                            >
                                <NotificationIcon type={notification.type} />

                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-col justify-between gap-1 sm:flex-row">
                                        <h3
                                            className={`font-semibold ${notification.read
                                                    ? "text-slate-700"
                                                    : "text-slate-900"
                                                }`}
                                        >
                                            {notification.title}
                                        </h3>

                                        <span className="text-xs text-slate-400">
                                            {notification.time}
                                        </span>
                                    </div>

                                    <p className="mt-1 text-sm leading-6 text-slate-600">
                                        {notification.message}
                                    </p>

                                    <div className="mt-3 flex gap-2">
                                        {!notification.read && (
                                            <button
                                                onClick={() => markAsRead(notification.id)}
                                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                            >
                                                <Check size={14} />
                                                Mark as read
                                            </button>
                                        )}

                                        <button
                                            onClick={() =>
                                                removeNotification(notification.id)
                                            }
                                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                                        >
                                            <Trash2 size={14} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

function NotificationIcon({
    type,
}: {
    type: NotificationType;
}) {
    const config = {
        domain: {
            icon: <Globe size={19} />,
            className: "bg-blue-50 text-blue-600",
        },
        hosting: {
            icon: <Server size={19} />,
            className: "bg-purple-50 text-purple-600",
        },
        renewal: {
            icon: <RefreshCcw size={19} />,
            className: "bg-amber-50 text-amber-600",
        },
        system: {
            icon: <AlertTriangle size={19} />,
            className: "bg-red-50 text-red-600",
        },
    };

    return (
        <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config[type].className}`}
        >
            {config[type].icon}
        </div>
    );
}