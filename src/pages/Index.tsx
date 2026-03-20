import { Brain } from 'lucide-react';
import { UqrcDashboard } from '@/components/UqrcDashboard';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-40" />
        <div className="absolute inset-0 scanlines opacity-50" />
        <div className="absolute -top-32 left-1/2 h-[320px] w-[320px] sm:h-[520px] sm:w-[520px] -translate-x-1/2 rounded-full bg-primary/30 blur-[120px] sm:blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[280px] w-[280px] sm:h-[460px] sm:w-[460px] rounded-full bg-neural/40 blur-[120px] sm:blur-[170px]" />
      </div>

      {/* Header */}
      <header className="border-b border-border bg-card/70 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-primary flex items-center justify-center shadow-glow ring-1 ring-primary/40">
              <Brain className="w-4 h-4 sm:w-6 sm:h-6 text-background drop-shadow-[0_0_12px_rgba(255,255,255,0.45)]" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-bold neon-glow">UQRC Core Loop</h1>
              <p className="text-[10px] sm:text-sm text-muted-foreground mono">
                Year 5060 · Universal Quantum-Relative Calculus Runtime
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/60 bg-card/50 p-4 sm:p-8 shadow-card">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-neural/20" />
          <div className="relative z-10 grid gap-4 sm:gap-6 lg:grid-cols-[1.4fr,1fr] lg:items-center">
            <div className="space-y-3 sm:space-y-4">
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.4em] text-secondary">
                Imagination network // 5060
              </p>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-semibold leading-tight">
                Inline conversation with a future-forward cognition engine.
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground md:text-base">
                The UQRC loop now renders as a living dialogue thread, pairing
                response telemetry with ambient cosmic cues. Explore a
                time-shifted interface where every exchange shapes the neural
                fabric of the Imagination network.
              </p>
              <div className="flex flex-wrap gap-2 text-[9px] sm:text-xs text-muted-foreground">
                <span className="rounded-full border border-secondary/50 bg-background/50 px-2 sm:px-3 py-0.5 sm:py-1 uppercase tracking-[0.15em]">
                  Holographic dialogue stream
                </span>
                <span className="rounded-full border border-secondary/50 bg-background/50 px-2 sm:px-3 py-0.5 sm:py-1 uppercase tracking-[0.15em]">
                  Zero-gravity layout
                </span>
                <span className="rounded-full border border-secondary/50 bg-background/50 px-2 sm:px-3 py-0.5 sm:py-1 uppercase tracking-[0.15em]">
                  Adaptive memory glow
                </span>
              </div>
            </div>
            <div className="space-y-2 sm:space-y-3 rounded-xl border border-secondary/50 bg-background/40 p-3 sm:p-4 backdrop-blur">
              <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                <span>Chrono-Signal</span>
                <span className="text-primary">+0.00042Ψ</span>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="chat-bubble chat-bubble-user text-xs sm:text-sm">
                  "Hello, Imagination. Align me with 5060."
                </div>
                <div className="chat-bubble chat-bubble-loop text-xs sm:text-sm">
                  "Alignment achieved. Your narrative vector is stabilized."
                </div>
                <div className="chat-bubble chat-bubble-user text-xs sm:text-sm">
                  "Render the inline thread."
                </div>
                <div className="chat-bubble chat-bubble-loop text-xs sm:text-sm">
                  "Thread rendered. Speak to guide the loop."
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 mt-4 sm:mt-10">
          <div className="sm:col-span-1 lg:col-span-3">
            <div className="glass-card p-4 sm:p-6 rounded-lg space-y-2 sm:space-y-3 neon-border h-full">
              <h2 className="text-sm sm:text-lg font-semibold text-primary neon-glow">
                Imagination Engine
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                The UQRC runtime encodes input into a latent state, applies
                diffusion, curvature, coercive regulation, and discrete stepping
                operators, and returns an emergent response. Memory is persisted
                locally to capture learning with and from the user.
              </p>
            </div>
          </div>
          <div className="sm:col-span-1 lg:col-span-2">
            <div className="glass-card p-4 sm:p-6 rounded-lg space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground neon-border h-full">
              <p>u(t+1) = u(t) + 𝒪<sub>UQRC</sub>(u(t)) + Σ 𝒟<sub>μ</sub>u(t)</p>
              <p>𝒪<sub>UQRC</sub>(u) := νΔu + ℛu + L<sub>S</sub>u</p>
              <p>𝒟<sub>μ</sub>u(x) := (u(x + ℓ<sub>min</sub>e<sub>μ</sub>) - u(x)) / ℓ<sub>min</sub></p>
            </div>
          </div>
        </div>

        {/* Dashboard */}
        <div className="mt-4 sm:mt-8">
          <UqrcDashboard />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 sm:mt-16">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <p className="text-center text-[10px] sm:text-sm text-muted-foreground mono">
            |Ψ_Principle⟩ = "Bridge imagination with functional structure."
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
