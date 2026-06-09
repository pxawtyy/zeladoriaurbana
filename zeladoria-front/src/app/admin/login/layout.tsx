import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Zeladoria Urbana — Login Administrativo",
    description: "Área de Login para administradores do sistema.",
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}