export function ErrorBanner({ messages }: { messages: string[] }) {
  if (messages.length === 0) return null;
  return (
    <div className="rounded-lg px-3 py-2 mb-3 text-sm bg-rose-50" style={{ backgroundColor: "#FBEAEA", color: "#B23A48" }}>
      {messages.map((m, i) => (
        <p key={i}>{m}</p>
      ))}
    </div>
  );
}
