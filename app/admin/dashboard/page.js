"use client";
import { useRouter } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { useState } from "react";

export default function AdminPage() {
  const router = useRouter();
  const [allowedThemes, setAllowedThemes] = useState(["classic","midnight","neon"]);
  return (
    <AdminDashboard
      onClose={()=>router.push("/")}
      allowedThemes={allowedThemes}
      setAllowedThemes={setAllowedThemes}
    />
  );
}
