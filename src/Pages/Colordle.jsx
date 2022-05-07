
import React, { Component } from 'react';
import './Colordle.css'
import color_wheel from '../img/color_wheel.png'

const COLOR_LENGTH = 6;
const NUM_GUESSES = 6;
const FEEDBACK = {
    gray: 0,
    yellow: 1,
    green: 2,
    silver: 3
}
const GRAY = "lightslategrey";
const YELLOW = "yellow";
const GREEN = "green";
const SILVER = "silver";
const COLORS = [GRAY, YELLOW, GREEN, SILVER];

const KEYCODE_0 = 48;
const KEYCODE_9 = 57;
const KEYCODE_A = 65;
const KEYCODE_F = 70;
const KEYCODE_ENTER = 13;
const KEYCODE_BACKSPACE = 8;
const KEYCODE_DELETE = 46;

function set_seed(s) {
    return function() {
        s = Math.sin(s) * 10000; return s - Math.floor(s);
    };
};
function print(x){
    console.log(x);
}
const mod = 16777216;
class Colordle extends Component{
    constructor(props){
        super(props);
        let vt = [];
        let ct = [];
        for(let i = 0; i < COLOR_LENGTH; i++){
            let varr = [];
            let carr = [];
            for(let j = 0; j < NUM_GUESSES; j++){
                varr[j] = '';
                carr[j] = FEEDBACK.gray;
            }
            vt[i] = varr;
            ct[i] = carr;
        }
        this.state = {
            color: this.generateHexColor(0xfff),
            value_table: vt,
            color_table: ct,
            row: 0,
            index: 0
        };
        this.counter = 0;
        
    }
    render(){
        let num = Number("0x" +this.state.color);
        return (
            <div className="colordle">
                <div className="color-display" style={{backgroundColor: "#" + this.state.color, color:(this.getContrastColor(Number("0x"+this.state.color)))}}>Current Color</div>
                <div style={{display:'flex', justifyContent: 'center'}}>
                    
                    {/* <button onClick={()=> this.clearBoard()}>Clear</button> */}
                </div>
                <div className="guess-board">
                    {this.state.value_table.map((value,index) => (
                        <div className={'row-' + index} style={{display: "flex"}} key={index}>
                            {value.map((val, i) => (
                                <Tile className={"tile-" + i} value={this.state.value_table[index][i]} color={COLORS[this.state.color_table[index][i]]} key={i}>
                                    {val}
                                </Tile>
                            ))}
                        </div>
                    ))}
                </div>
                <button onClick={()=> this.generateHexColor(++this.counter)}>New Color</button>
            </div>
        );
    }
    componentDidMount(){
        document.addEventListener('keydown', this.keyboardHandler.bind(this));
        this.setState();
    }
    generateHexColor(seed) {
        this.clearBoard();
        let random = set_seed(seed);
        let num = Math.floor(random() * mod);
        let hexString = num.toString(16);
        let str = "";
        if(hexString.length < COLOR_LENGTH){
            let diff = COLOR_LENGTH - hexString.length;
            for(let i = 0; i < diff; i++){
                str += "0";
            }
        }
        hexString = str + hexString;
        hexString = this.scrambleDigits(hexString);
        this.setState({color: hexString});
        return hexString;
    }
    scrambleDigits(hex){
        let ret = hex[2] + hex[5] + hex[0] + hex[4] + hex[1] + hex[3];
        return ret;
    }

    checkGuess(guess){
        if(!guess || guess.length !== COLOR_LENGTH || this.state.index !== COLOR_LENGTH){
            return null;
        }
        let color = this.state.color;
        let ret = Array(COLOR_LENGTH).fill(FEEDBACK.silver);
        let guess_used = Array(COLOR_LENGTH).fill(false);
        let color_used = Array(COLOR_LENGTH).fill(false);
        // check strict matches
        for (let i = 0; i < COLOR_LENGTH; i++){
            if(guess[i].toLowerCase() === color[i].toLowerCase()){
                ret[i] = FEEDBACK.green;
                guess_used[i] = true;
                color_used[i] = true;
            }
        }

        // check loose matches
        for(let i = 0; i < COLOR_LENGTH; i++){
            if(guess_used[i]) continue;
            for(let j = 0; j < COLOR_LENGTH; j++){
                if(color_used[j] || j === i) continue;
                if(guess[i].toLowerCase() === color[j].toLowerCase()){
                    ret[i] = FEEDBACK.yellow;
                    guess_used[i] = true;
                    color_used[j] = true;
                }
            }
        }
        return ret;
    }

    getTileByCoordinate(x, y){
        let tile = document.getElementsByClassName('row-' + x)[0].getElementsByClassName('tile-' + y)[0];
        return tile;
    }
    keyboardHandler(e){
        let code = e.which;
        if((KEYCODE_0 <= code && code <= KEYCODE_9) || (KEYCODE_A <= code && code <= KEYCODE_F)){
            this.handleInput(String.fromCharCode(code));
        }
        if(code === KEYCODE_ENTER){
            this.submitGuess();

        }
        if(code === KEYCODE_BACKSPACE || code === KEYCODE_DELETE){
            this.deleteOne();
        }
    }

    handleInput(char){
        let y = this.state.row;
        let x = this.state.index;
        if(y >= NUM_GUESSES || x >= COLOR_LENGTH){
            return;
        }
        this.setTile(x, y, char, null);
        this.setState({index: x+1});
    }

    setTile(x, y, value, color){
        if(x >= COLOR_LENGTH || y >= NUM_GUESSES)
            return;
        let state = {};
        if(value !== null){
            state.value_table = this.state.value_table;
            state.value_table[y][x] = value;
        }
        if(color !== null){
            state.color_table = this.state.color_table;
            state.color_table[y][x] = color;
        }
        this.setState(state);
    }
    deleteOne(){
        let y = this.state.row;
        let x = this.state.index;
        if(y < 0 || x <= 0){
            return;
        }
        this.setTile(x-1, y, '', null);
        this.setState({index: x-1});
    }
    submitGuess(){
        let arr = this.state.value_table[this.state.row];
        let feedback = this.checkGuess(this.state.value_table[this.state.row]);
        if(!feedback) return;
        // update
        let state = {color_table: this.state.color_table};
        state.color_table[this.state.row] = feedback;
        state.row = this.state.row + 1;
        if(state.row >= NUM_GUESSES) state.row = NUM_GUESSES - 1;
        state.index = 0;
        this.setState(state);
    }
    clearBoard(){
        let vt = [];
        let ct = [];
        for(let i = 0; i < COLOR_LENGTH; i++){
            let varr = [];
            let carr = [];
            for(let j = 0; j < NUM_GUESSES; j++){
                varr[j] = '';
                carr[j] = FEEDBACK.gray;
            }
            vt[i] = varr;
            ct[i] = carr;
        }
        this.setState({color_table:ct, value_table:vt, row:0, index:0});
    }
    getContrastColor(color){
        return color > 0xFFFFFF/2 ? 'black' : 'white'
    }
}

class Tile extends Component{
    constructor(props){
        super(props);
        this.state = {
            color: COLORS[props.color],
            value: props.value
        }
    }
    render(){
        let css = {
            height: "40px", 
            width: "40px", 
            backgroundColor: this.state.color,
            margin: "2px",
            borderStyle: "solid",
            borderColor: "black",
            color: "black"
        };
        return(
        <div className={this.props.className} style={css}>
            <p>{this.state.value}</p>
        </div>
        );
    }
    componentDidUpdate(prevProps){
        if(prevProps.value !== this.props.value || prevProps.color !== this.props.color){
            this.setState({value: this.props.value, color: this.props.color});
            console.log("Updated!");
        }        
    }
}

function ColordlePage() {
    return (
      <div className="colordle-page">
        <header className="colordle-header">
         <div><b>Colordle</b></div>
         <img src={color_wheel} className="Color-wheel" alt="color-wheel"/>
        </header>
        <Colordle></Colordle>
      </div>
    );
  }

  export default ColordlePage;