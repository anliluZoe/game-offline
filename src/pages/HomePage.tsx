import { Link } from 'react-router-dom'

const games = [
  {
    id: 'gomoku',
    name: '五子棋',
    blurb: '15 路自由五子，同一设备轮流落子',
    to: '/gomoku',
  },
  {
    id: 'checkers',
    name: '跳棋',
    blurb: '中式跳棋，红绿对向，同一设备轮流跳',
    to: '/checkers',
  },
]

export default function HomePage() {
  return (
    <main className="home">
      <header className="home-hero">
        <p className="eyebrow">离线可玩</p>
        <h1>棋盘小游戏</h1>
        <p className="lede">打开就能下，断网也不耽误。</p>
      </header>
      <ul className="game-grid">
        {games.map((game) => (
          <li key={game.id}>
            {game.to ? (
              <Link className="game-card" to={game.to}>
                <h2>{game.name}</h2>
                <p>{game.blurb}</p>
                <span className="card-action">开始对弈</span>
              </Link>
            ) : (
              <div className="game-card is-disabled">
                <h2>{game.name}</h2>
                <p>{game.blurb}</p>
                <span className="card-action">即将推出</span>
              </div>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}
