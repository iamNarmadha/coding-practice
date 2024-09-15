const express = require('express')
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')

const app = express()
app.use(express.json())

const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null
const initialiseDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is Running')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initialiseDBAndServer()

app.get('/players/', async (request, response) => {
  const playerQuery = `
  SELECT 
  * 
  FROM 
  cricket_team 
  ORDER BY 
  player_id;`
  const players = await db.all(playerQuery)
  const result = players => {
    return {
      playerId: players.player_id,
      playerName: players.player_name,
      jerseyNumber: players.jersey_number,
      role: players.role,
    }
  }
  response.send(players.map(eachPlayer => result(eachPlayer)))
})

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayer = `
  INSERT INTO cricket_team (player_name, jersey_number, role) VALUES('${playerName}',${jerseyNumber},'${role}');`
  const dbResponse = await db.run(addPlayer)
  const player_id = dbResponse.lastID
  response.send('Player Added to Team')
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayer = `
  SELECT
   * 
  FROM 
  cricket_team 
  WHERE 
  player_id = ${playerId};`

  const player = await db.get(getPlayer)
  response.send(player)
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const updatePlayer = `
  UPDATE
   cricket_team
  SET
   player_name = '${playerName}',
   jersey_number=${jerseyNumber},
   role='${role}'
   WHERE player_id=${playerId};
   `
  await db.run(updatePlayer)
  response.send('Player Details Updated')
})

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayer = `
  DELETE FROM 
  cricket_team
  WHERE 
  player_id=${playerId};`
  await db.run(deletePlayer)
  response.send('Player Removed')
})
module.exports = app
