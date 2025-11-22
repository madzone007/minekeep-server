const mineflayer = require('mineflayer');

let bot = null;
let connectionAttempts = 0;
let antiAFKInterval = null;
let isServerStarting = false;

function createBot() {
  connectionAttempts++;
  console.log(`🔗 Connection attempt #${connectionAttempts} - This will AUTO-START the server!`);
  
  bot = mineflayer.createBot({
    host: '191.96.231.10',
    port: 31454,
    username: 'AutoStartBot',
    version: '1.21', // Match your server version
    checkTimeoutInterval: 60 * 1000, // Longer timeout for server start
  });

  bot.on('login', () => {
    console.log('✅ Bot logged in! Server is starting up...');
  });

  bot.on('spawn', () => {
    console.log('🎉 SUCCESS! Server is now ONLINE and bot joined!');
    console.log('🤖 Bot will keep server active 24/7');
    connectionAttempts = 0;
    isServerStarting = false;
    startAntiAFK();
  });

  bot.on('end', async (reason) => {
    console.log(`🔌 Disconnected: ${reason}`);
    stopAntiAFK();
    
    if (reason.includes('ECONNREFUSED') || reason.includes('timed out')) {
      console.log('🚨 Server appears offline. Attempting to AUTO-START by reconnecting...');
      console.log('💡 Minekeep will automatically start server when connection is attempted!');
    }
    
    // Keep trying - each attempt triggers auto-start
    const delay = Math.min(30000, connectionAttempts * 10000); // 10-30 second delays
    console.log(`🔄 Reconnecting in ${delay/1000} seconds to trigger auto-start...`);
    setTimeout(createBot, delay);
  });

  bot.on('error', (err) => {
    console.log('❌ Connection error:', err.message);
    
    // These errors usually mean server is starting
    if (err.code === 'ECONNREFUSED' || err.message.includes('timed out')) {
      console.log('⏳ Server is likely starting up. Waiting...');
    }
  });

  // Handle auth issues
  bot.on('kicked', (reason) => {
    console.log('🚫 Bot was kicked:', reason);
  });
}

function startAntiAFK() {
  console.log('🤖 Anti-AFK system activated!');
  
  if (antiAFKInterval) {
    clearInterval(antiAFKInterval);
  }
  
  antiAFKInterval = setInterval(() => {
    if (!bot || !bot.entity) return;
    
    const actions = [
      () => { 
        bot.setControlState('jump', true);
        setTimeout(() => bot.setControlState('jump', false), 500);
        console.log('🤖 Anti-AFK: Jumped');
      },
      () => {
        const yaw = Math.random() * Math.PI * 2;
        const pitch = Math.random() * Math.PI - Math.PI / 2;
        bot.look(yaw, pitch, false);
        console.log('🤖 Anti-AFK: Looked around');
      },
      () => {
        // Simple movement
        bot.setControlState('forward', true);
        setTimeout(() => {
          bot.setControlState('forward', false);
          bot.setControlState('back', true);
          setTimeout(() => bot.setControlState('back', false), 500);
        }, 500);
        console.log('🤖 Anti-AFK: Moved');
      }
    ];
    
    const action = actions[Math.floor(Math.random() * actions.length)];
    action();
  }, 45000 + Math.random() * 30000); // Every 45-75 seconds
}

function stopAntiAFK() {
  if (antiAFKInterval) {
    clearInterval(antiAFKInterval);
    antiAFKInterval = null;
    console.log('🤖 Anti-AFK stopped');
  }
}

// Start the infinite loop
console.log('🚀 Starting Minekeep Auto-Start Bot...');
console.log('💡 Each connection attempt will trigger server auto-start!');
createBot();
