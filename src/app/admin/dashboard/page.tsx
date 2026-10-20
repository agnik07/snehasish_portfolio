import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import AdminDashboardClient from "./AdminDashboardClient";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Studio Administration Dashboard | Snehasish Dutta",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return <AdminDashboardClient admin={session} />;
}
