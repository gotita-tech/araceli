import { Button } from '@/components/ui/button';
import { StaticRipples } from '@/components/visual/static-ripples';

export default function NotFound() {
  return (
    <div className="relative flex min-h-[70svh] items-center overflow-hidden bg-ivory-paper pt-[68px]">
      <div className="pointer-events-none absolute inset-0 opacity-50" aria-hidden>
        <StaticRipples />
      </div>

      <div className="shell relative">
        <p className="eyebrow">Página no encontrada</p>
        <h1 className="mt-5 max-w-2xl font-serif text-headline font-light text-ink-900">
          Esta página no existe, pero el camino sigue abierto.
        </h1>
        <div className="mt-9 flex flex-wrap gap-3">
          <Button href="/">Ir a la portada</Button>
          <Button href="/mapa-interior" variant="secondary">
            Descubrir mi Mapa Interior
          </Button>
        </div>
      </div>
    </div>
  );
}
