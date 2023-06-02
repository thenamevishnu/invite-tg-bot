const {excQuery} = require("./config")
const Telegram = require("node-telegram-bot-api")
const {validate} = require("email-validator")
require("dotenv").config()
const config = require("./botConfig")
const token = process.env.token
const bot = new Telegram(token , { polling:true })

const table_name = process.env.table_name
const admin_id = process.env.admin_id

//Message handle

function just_alert(msg){
    const key = [
        [
            {text: "Verify",url:`${config.verifyUrl}/?id=${msg.chat.id}`}
        ]
    ]
    const text = "Verification is pending!\n\nVerify now!"
    bot.sendMessage(msg.chat.id,text,{parse_mode:"HTML",reply_markup:{inline_keyboard:key}})
}

bot.onText(/\/broadcast/, async (msg) => {
    if(msg.chat.id == process.env.admin_id){
        bot.sendMessage(msg.chat.id,"<i>👨‍💻 Send or forward any message for broadcast!</i>",{parse_mode:"HTML"})
        bot.once("message", async (msg) => {
            const result = await excQuery(`select user_id from ${table_name}`)
            result.forEach(async (obj,index) => {
                await bot.copyMessage(obj.user_id, process.env.admin_id, msg.message_id)
                if(index+1 == result.length){
                    await bot.sendMessage(process.env.admin_id,"✅ Broadcast success/Completed!")
                }
            })
            
        })
    }
})

bot.onText(/\/start/,async (msg) => {
    try{
        const message = msg.text
        const chat_id = msg.chat.id
        const first_name = msg.chat.first_name
        const username = msg.chat.username
        if(message.length > 10){
            let inviter = message.split(" ")[1]
            let sql  = `select * from ${table_name} where user_id = ${msg.chat.id}` 
            let result = await excQuery(sql)
            if(result.length===0){
                sql  = `select * from ${table_name} where inviter = ${inviter}` 
                result = await excQuery(sql)
                if(result.length===0){
                    inviter = admin_id
                }
                sql  = `insert into ${table_name} (user_id,first_name,username) values (${chat_id},'${first_name}','${username}')` 
                await excQuery(sql)
                bot.sendMessage(admin_id , `<b>New User\n\nUser : <a href='tg://user?id=${msg.chat.id}'>${msg.chat.first_name}</a>\nUserID : </b><code>${msg.chat.id}</code>`,{parse_mode:"HTML"})
            }
        }else{
            let sql  = `select * from ${table_name} where user_id = ${msg.chat.id}` 
            let result = await excQuery(sql)
            if(result.length===0){
                sql  = `insert into ${table_name} (user_id,first_name,username) values (${chat_id},'${first_name}','${username}')` 
                result =await excQuery(sql)
                bot.sendMessage(admin_id , `<b>New User\n\nUser : <a href='tg://user?id=${msg.chat.id}'>${msg.chat.first_name}</a>\nUserID : </b><code>${msg.chat.id}</code>`,{parse_mode:"HTML"})
            }
        }
        let flag = 0
        let i = 0
        let len = config.chats.length
        while(len){
            const status = await bot.getChatMember(config.chats[i].chat_id , msg.chat.id)
            if(status.status == "creator" || status.status == "administrator" || status.status == "member"){
                flag=1
            }
            len--
            i++
        }
        if(flag==0){
            let text = `🛸 Must join our channels!\n\n`
            config.chats.forEach(async (chat) => {
                text += `@${chat.username}\n\n`
            })
            text += "🛰️ Click Joined after completed!"
            const key = [
                ["✅ I have joined"]
            ]
            bot.sendMessage(chat_id,`<b>${text}</b>`,{reply_markup:{keyboard:key,resize_keyboard:true},parse_mode:"HTML",disable_web_page_preview:true})
        }else{
            const key = [
                ["🎁 Bonus"],["👛 My Account","🎖️ Referral"],["🕹️ Status"]
            ]
            const text = `<b>Welcome To @${config.botName}</b>`
            bot.sendMessage(chat_id,`<b>${text}</b>`,{reply_markup:{keyboard:key,resize_keyboard:true},parse_mode:"HTML"})
        }
    }catch(error){
        console.log(error);
    }
})

bot.on("message", async (msg) => {
    try{
        const res = await excQuery(`select ip,banned from ${table_name} where user_id = ${msg.chat.id}`)
        if(res[0]?.banned==false){
            const ip = res[0].ip
            const result = await excQuery(`select user_id , count(*) as total from ${table_name} where ip = '${ip}'`)
            if(result[0].total > 1){
                await excQuery(`update ${table_name} set banned=1 where ip = '${ip}'`)
                bot.sendMessage(msg.chat.id , "❌ You're banned!\nReason : Multiple Account!");
            }
        }
    }catch(err){
        console.log(err);
    }
})

bot.onText(/✅ I have joined|Back 🔙/,async (msg) => {
    try{
        const chat_id = msg.chat.id
        let flag = 0
        let i = 0
        let len = config.chats.length
        while(len){
            const status = await bot.getChatMember(config.chats[i].chat_id , msg.chat.id)
            if(status.status == "creator" || status.status == "administrator" || status.status == "member"){
                flag=1
            }
            len--
            i++
        }
        if(flag==0){
            let text = `🛸 Must join our channels!\n\n`
            config.chats.forEach(async (chat) => {
                text += `@${chat.username}\n\n`
            })
            text += "🛰️ Click Joined after completed!"
            const key = [
                ["✅ I have joined"]
            ]
            bot.sendMessage(chat_id,`<b>${text}</b>`,{reply_markup:{keyboard:key,resize_keyboard:true},parse_mode:"HTML"})
        }else{
            const key = [
                ["🎁 Bonus"],["👛 My Account","🎖️ Referral"],["🕹️ Status"]
            ]
            const text = `<b>Welcome To @${config.botName}</b>`
            bot.sendMessage(chat_id,`<b>${text}</b>`,{reply_markup:{keyboard:key,resize_keyboard:true},parse_mode:"HTML"})
        }
    }catch(err){
        console.log(err);
    }
})

bot.onText(/👛 My Account/,async (msg) => {
    try{
        const chat_id = msg.chat.id
        let flag = 0
        let i = 0
        let len = config.chats.length
        while(len){
            const status = await bot.getChatMember(config.chats[i].chat_id , msg.chat.id)
            if(status.status == "creator" || status.status == "administrator" || status.status == "member"){
                flag=1
            }
            len--
            i++
        }
        if(flag==0){
            let text = `🛸 Must join our channels!\n\n`
            config.chats.forEach(async (chat) => {
                text += `@${chat.username}\n\n`
            })
            text += "🛰️ Click Joined after completed!"
            const key = [
                ["✅ I have joined"]
            ]
            bot.sendMessage(chat_id,`<b>${text}</b>`,{reply_markup:{keyboard:key,resize_keyboard:true},parse_mode:"HTML",disable_web_page_preview:true})
        }else{
            let sql = `select * from ${table_name} where user_id = ${msg.chat.id}`
            const result = await excQuery(sql)
            if(result[0].verified==false){
                just_alert(msg)
            }else{
                const key = [
                    ["🏧 Wallet","📤 Withdraw"],["Back 🔙"]
                ]
                const text = `<b>👛 My Wallet\n➖➖➖➖\nFull Control over your ${config.currency} Funds\n\n Security\n➖➖➖➖\nYour wallet is secured by Telegram account\n\n💰 Earnings: ${result[0].balance.toFixed(6)} ${config.currency}\n✔️ Paid: ${result[0].wbalance.toFixed(6)} ${config.currency}</b>`
                bot.sendMessage(msg.chat.id , text , {parse_mode:"HTML",reply_markup:{keyboard:key,resize_keyboard:true}})
            }
        }
        
    }catch(err){
        console.log(err);
    }
})

bot.onText(/🎖️ Referral/,async (msg) => {
    try{
        const chat_id = msg.chat.id
        let flag = 0
        let i = 0
        let len = config.chats.length
        while(len){
            const status = await bot.getChatMember(config.chats[i].chat_id , msg.chat.id)
            if(status.status == "creator" || status.status == "administrator" || status.status == "member"){
                flag=1
            }
            len--
            i++
        }
        if(flag==0){
            let text = `🛸 Must join our channels!\n\n`
            config.chats.forEach(async (chat) => {
                text += `@${chat.username}\n\n`
            })
            text += "🛰️ Click Joined after completed!"
            const key = [
                ["✅ I have joined"]
            ]
            bot.sendMessage(chat_id,`<b>${text}</b>`,{reply_markup:{keyboard:key,resize_keyboard:true},parse_mode:"HTML",disable_web_page_preview:true})
        }else{
            const url = `https://telegram.me/${config.botName}?start=${msg.chat.id}`
            const result = await excQuery(`select * from ${table_name} where user_id = ${msg.chat.id}`)
            if(result[0].verified==false){
                just_alert(msg)
            }else{
                const text = `<b>🎖️ Referral Service\n➖➖➖➖➖➖\n👋 Hello, <a href='tg://user?id=${msg.chat.id}'>${msg.chat.first_name}</a>\nInvite your friends and get ${config.perRefer.toFixed(6)} ${config.currency}\n\nYour Stats:\n➖➖➖➖➖\nUser 🪪 : ${msg.chat.id}\nReferrals: ${result[0].invites}\nBonuses: ${result[0].balance.toFixed(6)} ${config.currency}\n\nInvite More And Earn More With ${config.botName}\n\nRefLink : ${url}</b>`
                bot.sendMessage(msg.chat.id , text , {parse_mode:"HTML",disable_web_page_preview:true})
            }
        }
        
        }catch(err){
        console.log(err);
    }
})

bot.onText(/🎁 Bonus/,async (msg) => {
    try{
        const chat_id = msg.chat.id
        let flag = 0
        let i = 0
        let len = config.chats.length
        while(len){
            const status = await bot.getChatMember(config.chats[i].chat_id , msg.chat.id)
            if(status.status == "creator" || status.status == "administrator" || status.status == "member"){
                flag=1
            }
            len--
            i++
        }
        if(flag==0){
            let text = `🛸 Must join our channels!\n\n`
            config.chats.forEach(async (chat) => {
                text += `@${chat.username}\n\n`
            })
            text += "🛰️ Click Joined after completed!"
            const key = [
                ["✅ I have joined"]
            ]
            bot.sendMessage(chat_id,`<b>${text}</b>`,{reply_markup:{keyboard:key,resize_keyboard:true},parse_mode:"HTML",disable_web_page_preview:true})
        }else{
           const result = await excQuery(`select * from ${table_name} where user_id = ${msg.chat.id}`)
            if(result[0].verified==false){
                just_alert(msg)
            }else{
                const text = `<b>Feeling lucky? Try your luck with our Mystery Box!\nEach time you open it, you'll have a chance to win random ${config.currency}. Here are your odds:\n\n⏰ Timer: Every ${config.dailyBonusTime} seconds\n\nJust click the OPEN button to play. Good luck! 🏆</b>`
                const key = [
                    [
                        { text : "🎁 Claim Bonus" , callback_data:"/claim" }
                    ]
                ]
                bot.sendMessage(msg.chat.id,text,{reply_markup:{inline_keyboard:key},parse_mode:"HTML"})
            } 
        }
        
    }catch(err){
        console.log(err);
    }
})

bot.onText(/🕹️ Status/, async (msg) => {
    try{
        const chat_id = msg.chat.id
        let flag = 0
        let i = 0
        let len = config.chats.length
        while(len){
            const status = await bot.getChatMember(config.chats[i].chat_id , msg.chat.id)
            if(status.status == "creator" || status.status == "administrator" || status.status == "member"){
                flag=1
            }
            len--
            i++
        }
        if(flag==0){
            let text = `🛸 Must join our channels!\n\n`
            config.chats.forEach(async (chat) => {
                text += `@${chat.username}\n\n`
            })
            text += "🛰️ Click Joined after completed!"
            const key = [
                ["✅ I have joined"]
            ]
            bot.sendMessage(chat_id,`<b>${text}</b>`,{reply_markup:{keyboard:key,resize_keyboard:true},parse_mode:"HTML",disable_web_page_preview:true})
        }else{
            const coin = "BTC,ETH,TRX"
            const currecy = await fetch(`https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${coin}&tsyms=USDT`)
            const response = await currecy.json()
            let label = ''
            const array = coin.split(",")
            for(key of array){
                let result = response["RAW"][key]["USDT"]
                const TOT_PRICE = (result.PRICE).toFixed(4)
                label += `<code>${key}: ${TOT_PRICE}$\n</code>`
            }
            const result = await excQuery(`select sum(wbalance) as payout,count(*) as totalUsers from ${table_name}`)
            const text = `<b>Total Users : ${result[0].totalUsers}\n\nTotal Payouts : </b><code>${result[0].payout.toFixed(6)} ${config.currency}</code>\n\n<b>📊 Currency Rates:\n\n${label}</b>\n\n<b>Time : </b><code>${new Date().toLocaleString("en-IN")}</code>`
            bot.sendMessage(msg.chat.id , text , {parse_mode:"HTML"})
        }
        
    }catch(err){
        console.log(err);
    }
})

bot.onText(/🏧 Wallet/, async (msg) => {
    try{
        const chat_id = msg.chat.id
        let flag = 0
        let i = 0
        let len = config.chats.length
        while(len){
            const status = await bot.getChatMember(config.chats[i].chat_id , msg.chat.id)
            if(status.status == "creator" || status.status == "administrator" || status.status == "member"){
                flag=1
            }
            len--
            i++
        }
        if(flag==0){
            let text = `🛸 Must join our channels!\n\n`
            config.chats.forEach(async (chat) => {
                text += `@${chat.username}\n\n`
            })
            text += "🛰️ Click Joined after completed!"
            const key = [
                ["✅ I have joined"]
            ]
            bot.sendMessage(chat_id,`<b>${text}</b>`,{reply_markup:{keyboard:key,resize_keyboard:true},parse_mode:"HTML",disable_web_page_preview:true})
        }else{
            const result = await excQuery(`select * from ${table_name} where user_id = ${msg.chat.id}`)
            if(result[0].verified==false){
                just_alert(msg)
            }else{
                const wallet = result[0].wallet
                let key
                let text
                if(wallet){
                    key = [
                        [
                            {text: "📝 Edit/Change Wallet",callback_data:"/change_email"}
                        ]
                    ]
                    text = `<b>📝 Your Withdrawal Wallet is needed to send you all the payouts coming from this bot.\n\n🔎 Your currently set ${config.currency} Withdrawal Wallet is: <code>${wallet}</code>\n\n✅ It will be used by us for All your future withdrawals</b>`
                }else{
                    text = `<b>❕To ask for withdrawal you need to set a Withdrawal Wallet\n\n➡️ Your TRON Withdrawal Wallet is currently not set!\n\nSet a wallet to proceed</b>`
                    key = [
                        [
                            {text: "➕ Set New Wallet ➕",callback_data:"/change_email"}
                        ]
                    ]
                }
                bot.sendMessage(msg.chat.id, text, {reply_markup:{inline_keyboard:key},parse_mode:"HTML",disable_web_page_preview:true})
            }
        }
        
    }catch(err){
        console.log(err);
    }
})

bot.onText(/📤 Withdraw/, async (msg) => {
    try{
        const chat_id = msg.chat.id
        let flag = 0
        let i = 0
        let len = config.chats.length
        while(len){
            const status = await bot.getChatMember(config.chats[i].chat_id , msg.chat.id)
            if(status.status == "creator" || status.status == "administrator" || status.status == "member"){
                flag=1
            }
            len--
            i++
        }
        if(flag==0){
            let text = `🛸 Must join our channels!\n\n`
            config.chats.forEach(async (chat) => {
                text += `@${chat.username}\n\n`
            })
            text += "🛰️ Click Joined after completed!"
            const key = [
                ["✅ I have joined"]
            ]
            bot.sendMessage(chat_id,`<b>${text}</b>`,{reply_markup:{keyboard:key,resize_keyboard:true},parse_mode:"HTML",disable_web_page_preview:true})
        }else{
            const result = await excQuery(`select * from ${table_name} where user_id = ${msg.chat.id}`)
            if(result[0].verified==false){
                just_alert(msg)
            }else{
                if(result[0].banned){
                    const text = `<i>❌ You're banned user!</i>`
                    bot.sendMessage(msg.chat.id , text , {parse_mode : "HTML"})
                }else if(result[0].wallet == null){
                    const text = `<i>❌ Set wallet before trying to withdraw!</i>`
                    bot.sendMessage(msg.chat.id , text , {parse_mode : "HTML"})
                }else if(result[0].balance == 0){
                    const text = `<code>❌ You have only 0 ${config.currency}</b>`
                    bot.sendMessage(msg.chat.id , text , {parse_mode:"html"})
                }else if(result[0].balance < config.minPayout){
                    const text = `<code>❌ You have to own at least ${config.minPayout.toFixed(6)} ${config.currency} in your wallet to withdraw!</code>`
                    bot.sendMessage(msg.chat.id , text , {parse_mode:"HTML"})
                }else{
                    const text = `<b>🛸 Now you can withdraw your earnings\n\n➡️ Min : </b><code>${config.minPayout.toFixed(6)} ${config.currency}</code>\n<b>➡️ Max : </b><code>${result[0].balance.toFixed(6)} ${config.currency}</code>\n\n<b>🖋️ Enter the amount you want to withdraw!</b>`
                    await bot.sendMessage(msg.chat.id , text , {parse_mode : "HTML" , disable_web_page_preview:true})
                    bot.once("message", async (msg) => {
                        if(!isNaN(msg.text)){
                            const amt = parseFloat(msg.text)
                            if(result[0].banned){
                                const text = `<i>❌ You're banned user!</i>`
                                bot.sendMessage(msg.chat.id , text , {parse_mode : "HTML"})
                            }else if(amt < config.minPayout){
                                const text = `<i>❌ Minimum withdraw is ${config.minPayout.toFixed(6)} ${config.currency}</i>`
                                bot.sendMessage(msg.chat.id, text , {parse_mode : "html"})
                            }else if(amt > result[0].balance){
                                const text = `<i>❌ Maximum withdraw is ${result[0].balance.toFixed(6)} ${config.currency}</i>`
                                bot.sendMessage(msg.chat.id, text , {parse_mode : "html"})
                            }else{
                                const obj = {} 
                                obj.api_key=process.env.faucet_key
                                obj.amount=amt
                                obj.to=result[0].wallet
                                obj.currency=config.currency
                                const pay_now = await fetch(process.env.faucet_url , {
                                    method: "POST",
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(obj)
                                })
                                const response = await pay_now.json()
                                const payout_id = response.payout_id
                                const payout_user_hash = response.payout_user_hash
                                const status = response.status
                                if(status==200){
                                    const text = `<b>✅ Payment Successfull!\n\nTo : ${result[0].wallet}\nAmount : ${amt.toFixed(6)} ${config.currency}\n\npayout_id : ${payout_id}\npayout_user_hash : ${payout_user_hash}</b>`
                                    bot.sendMessage(msg.chat.id , text , {parse_mode : "HTML",disable_web_page_preview:true})
                                    await excQuery(`update ${table_name} set balance=balance-${amt},wbalance=wbalance+${amt} where user_id = ${msg.chat.id}`)
                                }else{
                                    const text = `<b>❌ Error happend!</b>`
                                    bot.sendMessage(msg.chat.id , text , {parse_mode : "HTML",disable_web_page_preview:true})
                                }
                            }
                        }
                    })
                }
            }
        }
        
    }catch(err){
        console.log(err);
    }
})


// Callback handle

bot.on("callback_query", async (query) => {

    const action = query.data

    if(action === "/change_email"){
        try{
            const text = `<i>✏️ Send now your Faucet email to use it in future withdrawals!!</i>`
            bot.editMessageText(text , {chat_id:query.message.chat.id, message_id:query.message.message_id,parse_mode:"HTML",disable_web_page_preview:true})
            bot.once("message", async (msg) => {
                if(!validate(msg.text)){
                    const text = `<b>❌ Invalid email\n\n❕To ask for withdrawal you need to set a Withdrawal Wallet\n\n➡️ Your TRON Withdrawal Wallet is currently not set!\n\nSet a wallet to proceed</b>`
                    const key = [
                        [
                            {text: "➕ Set New Wallet ➕",callback_data:"/change_email"}
                        ]
                    ]
                    bot.sendMessage(msg.chat.id, text, {reply_markup:{inline_keyboard:key},parse_mode:"HTML",disable_web_page_preview:true})
                }else{
                    const text = `<b>✅ Email set to : ${msg.text}</b>`
                    bot.sendMessage(msg.chat.id,text,{parse_mode:"HTML"})
                    await excQuery(`update ${table_name} set wallet='${msg.text}' where user_id = ${msg.chat.id}`)
                }
            })
        }catch(err){
            console.log(err);
        }
    }

    if(action === "/claim"){
        try{
            const result = await excQuery(`select * from ${table_name} where user_id = ${query.message.chat.id}`)
            const cooldown = result[0].cooldown
            const now = Math.floor(new Date().getTime() / 1000)
            const seconds = cooldown - now < 0 ? config.dailyBonusTime : cooldown - now
            var hours = Math.floor(seconds / 3600);
            var minutes = Math.floor((seconds % 3600) / 60);
            var remainingSeconds = seconds % 60;
            if(cooldown > now){
                const text = `<code>❌ You have to wait about ${hours > 0 ? hours+"hr " : ""}${minutes > 0 ? minutes+"min " : ""}${remainingSeconds} sec!</code>`
                bot.editMessageText(text,{chat_id:query.message.chat.id,message_id:query.message.message_id,parse_mode:"HTML"})
            }else{
                const bonus =Math.random() * (config.dailyBonus.max - config.dailyBonus.min) + config.dailyBonus.min
                const text = `<code>🎁 Your mystery box contains +${bonus.toFixed(6)} ${config.currency} this time.\n\nMystery Box Will Unlock after ${hours > 0 ? hours+"hr " : ""}${minutes > 0 ? minutes+"min " : ""}${remainingSeconds} sec! 🔓</code>`
                bot.editMessageText(text,{chat_id:query.message.chat.id,message_id:query.message.message_id,parse_mode:"HTML"})
                await excQuery(`update ${table_name} set balance=balance+${bonus},cooldown=${now + config.dailyBonusTime} where user_id = ${query.message.chat.id}`)
            }
        }catch(err){
            console.log(err);
        }
    }

})

