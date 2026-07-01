import StarWall from "@/components/mural/StarWall";

export default function MuralPage() {
  return (
    <div>
      <h2 className="font-display text-2xl text-lunar">Mural de recados</h2>
      <p className="mb-4 mt-1 text-sm text-mist/60">Cada recado vira uma estrela. Toque em uma estrela para ler. ✨</p>
      <StarWall />
    </div>
  );
}
