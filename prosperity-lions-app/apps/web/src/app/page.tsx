// Landing/start screen. Real design should follow the tone in
// docs/personality-quiz.md Section 2 ("Opening Screen").
export default function Home() {
  return (
    <main style={{ padding: 24, fontFamily: "sans-serif", maxWidth: 480, margin: "0 auto" }}>
      <h1>New year, new lion!</h1>
      <p>
        Answer a few quick questions about your Chinese New Year style, and meet the baby lion who
        matches you.
      </p>
      <a href="/quiz">Start the quiz</a>
    </main>
  );
}
