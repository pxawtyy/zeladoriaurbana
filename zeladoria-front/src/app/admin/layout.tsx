import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Zeladoria Urbana — Painel Administrativo",
    description: "Área de gerenciamento para administradores do sistema.",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}