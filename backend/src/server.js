import 'dotenv/config'
import app from './app.js'

const PORT = process.env.PORT || 5002

app.listen(PORT, () => {
  console.log(`🚀 CryptoAtlas API running on http://localhost:${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`)
})
