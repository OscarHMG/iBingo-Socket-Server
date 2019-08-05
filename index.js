// INIT SERVER SOCKET ELEMENTS
const express = require('express');
http = require('http');
app = express();
server = http.createServer(app);
io = require('socket.io').listen(server);
const CronJob = require('cron').CronJob;

const MIN_PLAYERS = 2;
let TOTAL_PEOPLE_IN_THE_ROOM = 0;

const ROOM = "SALA 1";
const INTERVAL_BINGO_NUMBER = 12 * 1000;

let POOL_NUMBERS = [];

const PATTERN = ["HORIZONTAL", "VERTICAL", "DIAGONAL", "CORNERS"];

let BINGOS_TO_PLAY = 1; 

var job;



app.get('/', (req, res) =>{
    res.send('Chat server is running on port 3000');
});

io.on('connection', socket =>{
    console.log('New user is in the room.')

    //Increment the counter of the users.
    TOTAL_PEOPLE_IN_THE_ROOM++;

    //Add user to the room.
    socket.join(ROOM);
    if(TOTAL_PEOPLE_IN_THE_ROOM >= MIN_PLAYERS){
        sendBingoNumber(socket);

    }else{
        console.log('Waiting to other players... Online players ATM: '+TOTAL_PEOPLE_IN_THE_ROOM);
    }


    //Someone, win!
    socket.on('BINGO', () =>{

        // Need to send the pool number ?
        //Notify all user except the bingo winner.
        BINGOS_TO_PLAY --;

        if(BINGOS_TO_PLAY == 0){
            console.log('BINGO!');
            socket.broadcast.emit('gameOver', "");
            restartInitRoomConfig();
        }
        
        
    });

    socket.on('disconnect', function() {
        TOTAL_PEOPLE_IN_THE_ROOM --;
        if(TOTAL_PEOPLE_IN_THE_ROOM == 0){
            restartInitRoomConfig();
        }
        console.log('Someone left the room.')
    
    });
    

});






// ************** FUNCTIONS ***************//


let restartInitRoomConfig =() =>{
    job.stop(); 
    POOL_NUMBERS = [];
    TOTAL_PEOPLE_IN_THE_ROOM = 0;
    BINGOS_TO_PLAY = 1;
}

let sendBingoNumber = (socket) => {

    //Task every 8 seconds
    job = new CronJob('*/8 * * * * *', function() {
        generateBingoNumber(socket);
    });

    job.start();
}

let generateBingoNumber =(socket) =>{
    let flag = false;
    let number = -1;
    do{      
        number = Math.floor(Math.random() * 75) + 1;
        if(!POOL_NUMBERS.includes(number))
            flag = true;
    }while (!flag);
    
    //Broadcast the number generated.
    if (number != -1){
        //Send to all, the number.
        
        let  message = {
            "gameType": PATTERN[2], 
            "bingosToPlay": BINGOS_TO_PLAY,
            "poolNumbers": POOL_NUMBERS,
            "number" : number,
            "peopleInTheRoom" : TOTAL_PEOPLE_IN_THE_ROOM
        };

        
        POOL_NUMBERS.push(number);
        io.sockets.in(ROOM).emit('number', message);

        console.log('Sended number : '+number);
    }
}






server.listen( 3000,  ()=> {
    console.log('Server socket app, is running on port 3000')
});

