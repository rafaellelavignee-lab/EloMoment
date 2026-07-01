import { Link } from "react-router-dom";
import StarField from "@/components/sky/StarField";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6 text-center">
      <StarField />
      <span className="text-6xl">🌠</span>
      <h1 className="mt-4 font-display text-3xl text-lunar">Página perdida entre as estrelas</h1>
      <Link to="/" className="btn-ghost mt-8">Voltar ao início</Link>
    </div>
  );
}
