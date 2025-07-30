import { defineStore } from 'pinia'

export interface Player {
  name: string
  scores: number[]
}

export interface Duel {
  id: string
  players: Player[]
  holes: number
  winner?: string
}

export const useDuelStore = defineStore('duel', {
  state: () => ({
    duels: [] as Duel[],
  }),
  actions: {
    addDuel(duel: Duel) {
      this.duels.push(duel)
    },
    recordScore(duelId: string, playerName: string, scores: number[]) {
      const duel = this.duels.find(d => d.id === duelId)
      if (!duel) return
      const player = duel.players.find(p => p.name === playerName)
      if (player) {
        player.scores = scores
      }
    },
    determineWinner(duelId: string) {
      const duel = this.duels.find(d => d.id === duelId)
      if (!duel) return
      let bestScore = Infinity
      let winnerName = ''
      duel.players.forEach(player => {
        const sum = player.scores.reduce((acc, s) => acc + s, 0)
        if (sum < bestScore) {
          bestScore = sum
          winnerName = player.name
        }
      })
      duel.winner = winnerName
    },
  },
})