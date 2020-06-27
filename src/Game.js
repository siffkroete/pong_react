// eslint-disable-next-line no-unused-vars
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { gameReducer } from './reducers/gameReducer'
import WebsocketClient from "./io/websocket_client";
import StartForm from './io/start-form';
import Player from './player';
import './css/Game.css';
import ChatForm from './io/chat-form';
import {
    MY_PLAYER,
    FOREIGN_PLAYER,
    ACTIONS,
    move_left_paddle,
    move_right_paddle,
    move_ball,
    move_object,
    sendGameControlMsg,
    sendChatMsg,
    sendGameData,
    startGame
} from './actions/';




class Game extends Component {
    constructor(props) {
        super(props);
        this.state = {
            gameState: 'stop',
            connectionState: 'disconnected',
            playerNames : ['Spieler1','Spieler2'],
            ball_state: {},
            paddle_state: {}
        }
    }

    stopId = 0;
    lastTime = 0;
    deltaTime = 0;
    renderLoopIsRunning = false;
    playerCount = 2;

    handleWebsocketMessage = (msg, type) => {
        this.setState({
            connectStatus: type
        });
    }

    renderLoop = (time = 0) => {
        this.deltaTime = time - this.lastTime;
        this.lastTime = time;
        this.stopId = window.requestAnimationFrame(this.renderLoop);
    }

    startRenderLoop = () => {
        this.lastTime = 0;
        window.requestAnimationFrame(this.renderLoop);
    }

    stopRenderLoop = () => {
        window.cancelAnimationFrame(this.stopId);
    }

    toggleRenderLoop = () => {
        if(this.renderLoopIsRunning === false) {
            this.startRenderLoop();
            this.renderLoopIsRunning = true;
        } else {
            if(this.stopId) this.stopRenderLoop();
            else console.error('Hier sollte die stopId gesetzt sein damit man die render-loop stoppen kann!');
            this.renderLoopIsRunning = false;
        }
    }

    connect = (e) => {
        this.setState({
            connectStatus: 'connected'
        });
    }

    startGame = (e) => {
        const msg = {
            type: 'GAMME_CONTROL_MSG',
            data: 'START_GAME',
            dest: this.state.playerNames[FOREIGN_PLAYER]
        }
        this.props.startGame(msg); // Dispatch Action for all Components
    }
      
    render() {
        return (
            <div id="game_content">
                <div id="game_title">{this.props.title} Connect state: {this.state.connectStatus}</div> 

                <div className="game_header">
                    <ChatForm
                        title="Chat"
                        playerName={this.state.playerNames[MY_PLAYER]}
                        class="chat_form" 
                    />

                    <StartForm 
                        id="startForm"
                        title="Spiel Starten"
                        handleSubmit={this.startGame}
                    />

                    <ChatForm
                        title="Chat"
                        playerName={this.state.playerNames[FOREIGN_PLAYER]}
                        class="chat_form" 
                    />
                </div>  {/* End game_header */}

                <div id="player_container">
                    <Player id="player_0" playerName={this.state.playerNames[MY_PLAYER]} />
                    <Player id="player_1" playerName={this.state.playerNames[FOREIGN_PLAYER]} />
                </div>

                <WebsocketClient
                    connect={this.connect}
                    handleMessage={this.handleWebsocketMessage}
                />

            </div>
        );
    }
}


const mapStateToProps = (state) => {
    return {
        gameState: state.gameReducer.gameState,
        connectionState: state.gameReducer.connectionState,
        ball_state: state.ball_reducer,
        paddle_state: state.paddle_reducer,
    };
}

const mapDispatchToProps = dispatch => ({
    sendGameControlMsg: (msg) => {
        dispatch(sendGameControlMsg(msg));
    },
    sendGameData: (msg) => {
        dispatch(sendGameData(msg));
    },
    sendChatMsg: (msg) => {
        dispatch(sendChatMsg(msg));
    },
    startGame: (msg) => {
        dispatch(startGame(msg));
    }
});

const connectedGameComponent = connect(mapStateToProps, mapDispatchToProps)(Game);

export default connectedGameComponent;
