// Landing/cover screen. Tone follows docs/personality-quiz.md Section 2
// ("Opening Screen").
export default function Home() {
  const lionIds = ["hong_hong", "rui_rui", "xing_xing", "xi_xi", "zhi_zhi"];

  return (
    <main className="storybook-page">
      <div className="cover">
        <div className="cover-lions">
          {lionIds.map((id) => (
            <img key={id} src={`/lions/${id}.svg`} alt="" />
          ))}
        </div>
        <h1 className="storybook-heading" style={{ fontSize: 32, margin: 0 }}>
          New year, new lion!
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: "#6b5245" }}>
          Answer a few quick questions about your Chinese New Year style, and meet the baby lion
          who matches you.
        </p>
        <p style={{ fontSize: 13, color: "#9a7d68" }}>
          Been celebrating all your life, or first time? Everyone&rsquo;s welcome.
        </p>
        <a href="/quiz" className="btn-primary">
          Start the story
        </a>
      </div>
    </main>
  );
}
