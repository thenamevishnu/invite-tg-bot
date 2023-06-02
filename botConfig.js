module.exports = {
    perRefer : 1, // per refer amount
    currency : "TRX", // currecy name in caps
    botName : "inflactbot", //bot username without @
    chats:[{chat_id:-1001522362621,username:"devbean"}], // chat username - users must join before start bot - set as an object array [{},{},{}]
    dailyBonusTime: 60, //daily bonus time in seconds ( 86400 === 1 day (24hrs))
    dailyBonus: {
        min:0.1,
        max:1
    }, //daily bonus amount
    minPayout: 10, //minimum payout
    verifyUrl: "https://api.crypto-twilight.com/verify" //change with your url
}