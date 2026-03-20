import { useMemo, useState } from "react";
import {
  createBrowserMemoryStore,
  createBrowserMetricsStore,
  createBrowserTrainingHookStore,
  decodeOutput,
  initializeInteractionState,
  runInteractionStep,
  TrainingHook,
} from "@/uqrc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react";
import { LearningLine } from "@/components/LearningLine";

const formatValue = (value: number) => value.toFixed(3);

interface ConsoleEntry {
  input: string;
  output: string;
  step: number;
  id: string;
}

type InlineFeedback = Record<string, 'reinforce' | 'correct' | 'flag'>;

const entryId = (entry: { step: number; input: string }) =>
  `${entry.step}-${entry.input.slice(0, 20)}`;

export const UqrcDashboard = () => {
  const memory = useMemo(() => createBrowserMemoryStore("uqrc-memory"), []);
  const metricsStore = useMemo(
    () => createBrowserMetricsStore("uqrc-metrics"),
    []
  );
  const trainingHookStore = useMemo(
    () => createBrowserTrainingHookStore("uqrc-training-hooks"),
    []
  );
  const [state, setState] = useState(() => {
    const stored = memory.latestState();
    const initial = initializeInteractionState({
      memory,
      dimension: stored?.length ?? 8,
    });
    if (stored) {
      initial.u = stored;
    }
    return initial;
  });
  const [params] = useState({
    nu: 0.2,
    beta: 0.05,
    lMin: 1,
    curvatureStrength: 1,
    attractorStrength: 0.08,
    intentStrength: 0.12,
    continuityStrength: 0.1,
    narrativeTimeWeight: 0.15,
    completionWeight: 0.4,
  });
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState(0.5);
  const [trainingMessage, setTrainingMessage] = useState("");
  const [trainingReply, setTrainingReply] = useState("");
  const [trainingIncurSentence, setTrainingIncurSentence] = useState("");
  const [trainingHooks, setTrainingHooks] = useState<TrainingHook[]>(
    trainingHookStore.list()
  );
  const [lastOutput, setLastOutput] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ConsoleEntry[]>([]);
  const [metricsEntries, setMetricsEntries] = useState(
    metricsStore.list()
  );
  const [inlineFeedback, setInlineFeedback] = useState<InlineFeedback>({});

  const handleInlineFeedback = (id: string, kind: 'reinforce' | 'correct' | 'flag') => {
    setInlineFeedback((prev) => {
      if (prev[id] === kind) return prev;
      return { ...prev, [id]: kind };
    });
    // Persist to localStorage for future P2P sync
    try {
      const key = 'uqrc-inline-feedback';
      const existing = JSON.parse(localStorage.getItem(key) || '{}');
      existing[id] = { kind, timestamp: Date.now(), peerId: 'local' };
      localStorage.setItem(key, JSON.stringify(existing));
    } catch { /* storage full or unavailable */ }
  };

  const handleRun = () => {
    if (!input.trim()) return;
    const result = runInteractionStep(input, state, {
      memory, metricsStore, params, feedback, trainingHooks,
    });
    setState(result.state);
    setLastOutput(result.output);
    setMetricsEntries(metricsStore.list());
    setInput("");
  };

  const handleTrain = () => {
    if (!trainingMessage.trim() || !trainingReply.trim()) return;
    const hook: TrainingHook = {
      message: trainingMessage.trim(),
      reply: trainingReply.trim(),
      incurSentence: trainingIncurSentence.trim(),
      createdAt: Date.now(),
    };
    trainingHookStore.addHook(hook);
    setTrainingHooks(trainingHookStore.list());
    setTrainingMessage("");
    setTrainingReply("");
    setTrainingIncurSentence("");
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const result = runInteractionStep(chatInput, state, {
      memory, metricsStore, params, feedback, trainingHooks,
    });
    setState(result.state);
    const newEntry: ConsoleEntry = {
      input: chatInput,
      output: result.output,
      step: result.state.step,
      id: entryId({ step: result.state.step, input: chatInput }),
    };
    setChatHistory((prev) => [...prev, newEntry]);
    setMetricsEntries(metricsStore.list());
    setChatInput("");
  };

  const normalized = state.u.map((v) => Math.max(-1, Math.min(1, v)));
  const memoryEntries = memory.list().slice(-5).reverse();
  const recentMetrics = metricsEntries.slice(-5).reverse();
  const latestMetrics = metricsStore.latest();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Inline Conversation */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-primary text-base sm:text-lg">Inline Conversation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Exchange in-line prompts with the loop. Each step emits a paired response.
          </p>
          <Textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleChatSend();
              }
            }}
            placeholder="Chat with the UQRC loop..."
            rows={3}
            className="text-sm"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button size="sm" onClick={handleChatSend}>Send Message</Button>
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              Shift + Enter for a new line
            </span>
          </div>
          <div className="space-y-3 max-h-64 sm:max-h-72 overflow-y-auto rounded-xl border border-border/60 bg-background/40 p-3">
            {chatHistory.length === 0 ? (
              <p className="text-xs sm:text-sm text-muted-foreground">
                No chat messages yet. Send a prompt to see the loop respond.
              </p>
            ) : (
              chatHistory.map((entry) => (
                <div key={entry.id} className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                    <span>Step {entry.step}</span>
                    <span>Inline thread</span>
                  </div>
                  <div className="grid gap-2">
                    <div className="chat-bubble chat-bubble-user justify-self-end text-xs sm:text-sm">
                      <span className="font-medium">You</span>: {entry.input}
                    </div>
                    <div className="chat-bubble chat-bubble-loop justify-self-start text-xs sm:text-sm">
                      <span className="font-medium text-foreground">Loop</span>:{" "}
                      {entry.output}
                    </div>
                  </div>
                  {/* P2P-ready feedback buttons */}
                  <div className="flex items-center gap-1 pl-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={`h-6 px-1.5 text-[10px] sm:text-xs ${inlineFeedback[entry.id] === 'reinforce' ? 'text-success' : 'text-muted-foreground'}`}
                      onClick={() => handleInlineFeedback(entry.id, 'reinforce')}
                    >
                      <ThumbsUp className="w-3 h-3 mr-0.5" />
                      Reinforce
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={`h-6 px-1.5 text-[10px] sm:text-xs ${inlineFeedback[entry.id] === 'correct' ? 'text-primary' : 'text-muted-foreground'}`}
                      onClick={() => handleInlineFeedback(entry.id, 'correct')}
                    >
                      <ThumbsDown className="w-3 h-3 mr-0.5" />
                      Correct
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className={`h-6 px-1.5 text-[10px] sm:text-xs ${inlineFeedback[entry.id] === 'flag' ? 'text-warning' : 'text-muted-foreground'}`}
                      onClick={() => handleInlineFeedback(entry.id, 'flag')}
                    >
                      <AlertTriangle className="w-3 h-3 mr-0.5" />
                      Flag
                    </Button>
                    {inlineFeedback[entry.id] && (
                      <span className="text-[9px] sm:text-[10px] text-muted-foreground ml-1">
                        Signal logged · peer:local
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Learning Line */}
      <LearningLine entries={metricsEntries} />

      {/* UQRC Core Loop */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-primary text-base sm:text-lg">UQRC Core Loop</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Send a single input through the UQRC update step.
          </p>
          <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleRun(); }}}
              placeholder="Input to encode"
              className="text-sm"
            />
            <Input
              type="number" min={0} max={1} step={0.05}
              value={feedback}
              onChange={(e) => setFeedback(Number(e.target.value))}
              placeholder="Feedback (0-1)"
              className="text-sm"
            />
          </div>
          <Button size="sm" onClick={handleRun}>Run UQRC Step</Button>
          {lastOutput && (
            <div className="rounded-md border border-border/60 bg-background/50 p-2 text-xs sm:text-sm">
              <p className="text-muted-foreground">Loop response</p>
              <p className="font-medium">{lastOutput}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Hooks */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-primary text-base sm:text-lg">Training Hooks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Input value={trainingMessage} onChange={(e) => setTrainingMessage(e.target.value)} placeholder="Message (exact match)" className="text-sm" />
          <Textarea value={trainingReply} onChange={(e) => setTrainingReply(e.target.value)} placeholder="Trained reply" rows={2} className="text-sm" />
          <Input value={trainingIncurSentence} onChange={(e) => setTrainingIncurSentence(e.target.value)} placeholder="Phrase incur sentence" className="text-sm" />
          <Button variant="secondary" size="sm" onClick={handleTrain}>Apply Training Update</Button>
        </CardContent>
      </Card>

      {/* Latent State Snapshot */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-primary text-base sm:text-lg">Latent State Snapshot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-[10px] sm:text-xs text-muted-foreground">
            Step {state.step} · Predicted cue: {decodeOutput(state.u, input || "")}
          </div>
          <div className="space-y-1.5">
            {normalized.map((value, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="w-8 sm:w-12 text-[10px] sm:text-xs text-muted-foreground">u[{index}]</span>
                <div className="flex-1 rounded-full bg-muted/40 h-1.5 sm:h-2">
                  <div className="h-full rounded-full bg-primary/80" style={{ width: `${Math.abs(value) * 100}%` }} />
                </div>
                <span className="w-10 sm:w-12 text-[10px] sm:text-xs text-muted-foreground text-right">{formatValue(value)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Memory */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-primary text-base sm:text-lg">Recent Memory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {memoryEntries.length === 0 ? (
            <p className="text-xs sm:text-sm text-muted-foreground">No memory entries yet. Run a step to persist data.</p>
          ) : (
            memoryEntries.map((entry) => (
              <div key={entry.timestamp} className="rounded-md border border-border/60 bg-background/50 p-2 text-xs sm:text-sm">
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {new Date(entry.timestamp).toLocaleTimeString()} · feedback: {entry.feedback ?? "-"}
                </p>
                <p className="font-medium">{entry.input}</p>
                <p className="text-muted-foreground">{entry.output}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Phase 7 Metrics */}
      <Card className="glass-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-primary text-base sm:text-lg">Phase 7 Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-xs sm:text-sm">
          {latestMetrics ? (
            <div className="rounded-md border border-border/60 bg-background/50 p-2 space-y-2">
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Step {latestMetrics.step} · {new Date(latestMetrics.timestamp).toLocaleTimeString()}
              </p>
              <div className="grid gap-2 grid-cols-2">
                <div>
                  <p className="text-muted-foreground">Semantic divergence</p>
                  <p className="font-medium">{formatValue(latestMetrics.semanticDivergence)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Closure latency</p>
                  <p className="font-medium">{latestMetrics.closureLatencyMs} ms · {latestMetrics.closureHoldSteps} holds</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Attractor distance</p>
                  <p className="font-medium">{formatValue(latestMetrics.attractorDistance)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Curvature magnitude</p>
                  <p className="font-medium">{formatValue(latestMetrics.curvatureMagnitude)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Entropy gate</p>
                  <p className="font-medium">{formatValue(latestMetrics.entropyGate)} · {latestMetrics.entropyActive ? "active" : "idle"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Memory alignment</p>
                  <p className="font-medium">{formatValue(latestMetrics.memoryAlignment)}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">No metrics yet. Run a step to collect Phase 7 signals.</p>
          )}
          <div className="space-y-1.5">
            <p className="text-[10px] sm:text-xs text-muted-foreground">Recent metric logs</p>
            {recentMetrics.length === 0 ? (
              <p className="text-muted-foreground">No metric entries recorded.</p>
            ) : (
              recentMetrics.map((entry) => (
                <div key={`${entry.timestamp}-${entry.step}`} className="rounded-md border border-border/60 bg-background/50 p-2">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Step {entry.step} · {new Date(entry.timestamp).toLocaleTimeString()}
                  </p>
                  <p className="text-muted-foreground">
                    Divergence {formatValue(entry.semanticDivergence)} · Closure {formatValue(entry.closureScore)} · Entropy {formatValue(entry.entropyGate)}
                  </p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
