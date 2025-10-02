export default function Home() {
  return (
    <main style={{ fontFamily: "sans-serif", padding: 40 }}>
      <h1>🚀 next-route-middleware Example</h1>
      <p>Try hitting:</p>
      <ul>
        <li><a href="/api/hello?id=42">/api/hello?id=42</a></li>
        <li><a href="/api/secure">/api/secure</a></li>
      </ul>
    </main>
  );
}
