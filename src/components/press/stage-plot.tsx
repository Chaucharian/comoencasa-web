function PlotItem({
  label,
  detail,
  accent = false,
}: {
  label: string;
  detail?: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span
        className={
          accent
            ? "size-2.5 rounded-full bg-primary"
            : "size-2.5 rounded-full border border-foreground/50"
        }
      />
      <p className="font-mono text-[10px] uppercase tracking-[0.22em]">{label}</p>
      {detail ? (
        <p className="max-w-[9rem] text-[11px] leading-snug text-muted-foreground">
          {detail}
        </p>
      ) : null}
    </div>
  );
}

function Wedge() {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="h-2 w-8 bg-foreground/80 [clip-path:polygon(12%_0,88%_0,100%_100%,0_100%)]" />
      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
        Monitor
      </span>
    </div>
  );
}

export function StagePlot() {
  return (
    <div className="border border-foreground/12 bg-secondary/40 px-4 py-8 md:px-10 md:py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <p className="eyebrow">Escenario</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Vista desde el público
        </p>
      </div>

      <div className="space-y-10 md:space-y-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 md:gap-4">
          <PlotItem label="JC-120" detail="Amp guitarra" />
          <PlotItem label="Fill" detail="Batería" />
          <PlotItem label="Batería" detail="Volpi" accent />
          <PlotItem label="PC" detail="Pistas" />
          <PlotItem label="GK-100" detail="Amp bajo" />
        </div>

        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <PlotItem label="Nord Stage" detail="Llull" />
          <PlotItem label="Voz" detail="Lucero" accent />
          <PlotItem label="Guitarra" detail="Lucero" />
          <PlotItem label="Bajo" detail="Manzo" />
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Wedge />
          <Wedge />
          <Wedge />
          <Wedge />
        </div>
      </div>

      <div className="mt-10 flex items-center gap-4">
        <span className="h-px flex-1 bg-foreground/12" />
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary">
          Público
        </p>
        <span className="h-px flex-1 bg-foreground/12" />
      </div>
    </div>
  );
}
