// INIT SERVER SOCKET ELEMENTS
const express = require('express');
http = require('http');
app = express();
server = http.createServer(app);
io = require('socket.io').listen(server);

const MIN_PLAYERS = 1;
let TOTAL_PEOPLE_IN_THE_ROOM = 0;
const IS_BINGO = false;
const ROOM = "SALA 1";
const INTERVAL_BINGO_NUMBER = 8 * 1000;

const POOL_NUMBERS = [];

const PATTERN = ["HORIZONTAL", "VERTICAL", "DIAGONAL", "CORNERS"];

const BINGOS_TO_PLAY = 1; 



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

        sendSettingsGame(socket);
    }else{
        console.log('Waiting to other players... Online players ATM: '+COUNT_PLAYERS);
    }
    

});


let sendBingoNumber = (socket) => {
    setInterval(function(){ 
        generateBingoNumber(socket)
    } , INTERVAL_BINGO_NUMBER);
}

let generateBingoNumber =(socket) =>{
    let flag = false;
    let number = -1;
    do{      
        number = Math.floor(Math.random() * 75) + 1;
        if(!POOL_NUMBERS.includes(number))
            flag = true;
        else
            console.log('Number repeated: '+number)
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

let sendSettingsGame = () =>{
    

}




server.listen( 3000,  ()=> {
    console.log('Server socket app, is running on port 3000')
});

