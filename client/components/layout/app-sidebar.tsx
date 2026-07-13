"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, LayoutDashboard, LogOut } from "lucide-react";

import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import ThemeToggle from "@/components/shared/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";

const NAV_LINKS = [
    {
        href: "/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
        match: (pathname: string) => pathname === "/dashboard",
    },
    {
        href: "/interviews",
        label: "Interviews",
        icon: Briefcase,
        match: (pathname: string) => pathname.startsWith("/interviews"),
    },
] as const;

function getInitials(name?: string) {
    if (!name?.trim()) {
        return "U";
    }

    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "U";
}

/**
 * Collapsible app sidebar — Linear-inspired navigation chrome.
 */
export default function AppSidebar() {
    const pathname = usePathname();
    const { data: user } = useCurrentUser();
    const logoutMutation = useLogout();

    return (
        <Sidebar collapsible="icon" variant="sidebar">
            <SidebarHeader className="gap-2 px-2 py-3">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2.5 rounded-md px-1.5 py-1 transition-colors hover:bg-sidebar-accent"
                >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-[11px] font-semibold tracking-tight text-sidebar-primary-foreground">
                        P
                    </span>
                    <span className="truncate text-sm font-semibold tracking-tight group-data-[collapsible=icon]:hidden">
                        PrepAI
                    </span>
                </Link>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {NAV_LINKS.map((link) => {
                                const isActive = link.match(pathname);
                                const Icon = link.icon;

                                return (
                                    <SidebarMenuItem key={link.href}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={link.label}
                                        >
                                            <Link href={link.href}>
                                                <Icon />
                                                <span>{link.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="gap-2 p-2">
                <Separator className="opacity-60" />

                <div className="flex items-center gap-2 rounded-md px-1 py-1 group-data-[collapsible=icon]:justify-center">
                    <Avatar size="sm" className="shrink-0">
                        <AvatarFallback className="bg-sidebar-accent text-[10px] font-medium">
                            {getInitials(user?.name)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                        <p className="truncate text-xs font-medium leading-tight">
                            {user?.name ?? "Account"}
                        </p>
                        <p className="truncate text-[11px] text-muted-foreground">
                            {user?.email ?? "Signed in"}
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-0.5 group-data-[collapsible=icon]:hidden">
                        <ThemeToggle />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Log out"
                            disabled={logoutMutation.isPending}
                            onClick={() => logoutMutation.mutate()}
                        >
                            <LogOut className="size-3.5" />
                        </Button>
                    </div>
                </div>

                <div className="hidden flex-col items-center gap-1 group-data-[collapsible=icon]:flex">
                    <ThemeToggle />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Log out"
                        disabled={logoutMutation.isPending}
                        onClick={() => logoutMutation.mutate()}
                    >
                        <LogOut className="size-3.5" />
                    </Button>
                </div>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}
