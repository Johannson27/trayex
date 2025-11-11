
import { redirect } from "next/navigation";

export default function Home() {
    redirect("/app"); // o "/dashboard" si así la llamas
}