'use client'

import { Users, Swords } from 'lucide-react'

export function FriendsTab() {
  return (
    <div className="com-friends-empty">
      <div className="com-friends-icon">
        <Swords size={26} />
      </div>
      <h3>Duelos privados em breve.</h3>
      <p>
        Adicionar amigos, ranking interno do seu círculo e desafios semanais
        diretos. Por enquanto, foque no que importa: subir no global.
      </p>
      <ul className="com-friends-features">
        <li><Users size={11} /> Ranking exclusivo entre amigos</li>
        <li><Swords size={11} /> Duelos de XP semanais</li>
        <li><Swords size={11} /> Comparação de streaks lado a lado</li>
      </ul>
    </div>
  )
}
